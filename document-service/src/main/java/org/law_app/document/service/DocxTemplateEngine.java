package org.law_app.document.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import lombok.extern.slf4j.Slf4j;
import org.docx4j.Docx4J;
import org.docx4j.TraversalUtil;
import org.docx4j.XmlUtils;
import org.docx4j.convert.out.HTMLSettings;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.Document;
import org.docx4j.wml.P;
import org.docx4j.wml.Tbl;
import org.docx4j.wml.Text;
import org.docx4j.wml.Tr;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
public class DocxTemplateEngine {

  public static final String DOCX_CONTENT_TYPE =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  private static final int MAX_COMPRESSED_BYTES = 30 * 1024 * 1024;
  private static final long MAX_UNCOMPRESSED_BYTES = 100L * 1024 * 1024;
  private static final int MAX_ZIP_ENTRIES = 2_048;
  private static final long MAX_SINGLE_ENTRY_BYTES = 50L * 1024 * 1024;

  private static final Pattern PLACEHOLDER =
      Pattern.compile("\\$\\{([A-Za-z][A-Za-z0-9_]{0,63})\\}");
  // Đánh dấu đoạn điều kiện: ${if_KEY} ... ${endif_KEY} (mỗi marker trên một dòng riêng ở thân văn
  // bản).
  private static final Pattern CONDITION =
      Pattern.compile("\\$\\{(if|endif)_([A-Za-z][A-Za-z0-9_]{0,57})\\}");
  private static final Pattern PLACEHOLDER_LIKE = Pattern.compile("\\$\\{[^}]*\\}");
  private static final Pattern EXTERNAL_RELATIONSHIP =
      Pattern.compile("(?i)TargetMode\\s*=\\s*[\"']External[\"']");

  public record TextMapping(String sampleText, String fieldKey, int expectedOccurrences) {}

  public Set<String> extractPlaceholders(InputStream docx) {
    return countPlaceholders(docx).keySet();
  }

  public Map<String, Integer> countPlaceholders(InputStream docx) {
    try {
      WordprocessingMLPackage pkg = loadSafe(docx);
      Map<String, Integer> counts = new java.util.LinkedHashMap<>();
      for (List<Text> block : findTextBlocks(pkg)) {
        String value = combinedText(block);
        validatePlaceholderSyntax(value);
        Matcher matcher = PLACEHOLDER.matcher(value);
        while (matcher.find()) counts.merge(matcher.group(1), 1, Integer::sum);
      }
      return java.util.Collections.unmodifiableMap(counts);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.warn("DOCX placeholder extraction failed: {}", e.getClass().getSimpleName());
      throw badRequest("Không đọc được file Word mẫu");
    }
  }

  public byte[] render(InputStream docx, Map<String, String> values) {
    try {
      WordprocessingMLPackage pkg = loadSafe(docx);
      applyConditionals(pkg, values == null ? Map.of() : values);
      renderOnPackage(pkg, values);
      return save(pkg);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error("DOCX render failed: {}", e.getClass().getSimpleName(), e);
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được file Word");
    }
  }

  /**
   * Render có hỗ trợ TRƯỜNG LẶP (bảng): mỗi list được nhân thành nhiều dòng bảng. Dòng mẫu trong
   * DOCX dùng placeholder {@code ${listKey__childKey}} (hai gạch dưới ngăn cách list và trường
   * con); engine nhân dòng theo số phần tử rồi điền từng dòng. Sau đó điền các placeholder scalar
   * còn lại.
   *
   * @param scalar giá trị cho placeholder thường {@code ${key}}
   * @param lists listKey -> danh sách phần tử; mỗi phần tử là map childKey -> giá trị
   */
  public byte[] renderWithLists(
      InputStream docx, Map<String, String> scalar, Map<String, List<Map<String, String>>> lists) {
    try {
      WordprocessingMLPackage pkg = loadSafe(docx);
      applyConditionals(pkg, scalar == null ? Map.of() : scalar);
      expandListRows(pkg, lists == null ? Map.of() : lists);
      renderOnPackage(pkg, scalar == null ? Map.of() : scalar);
      return save(pkg);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error("DOCX render (lists) failed: {}", e.getClass().getSimpleName(), e);
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được file Word");
    }
  }

  private void renderOnPackage(WordprocessingMLPackage pkg, Map<String, String> values)
      throws Exception {
    for (List<Text> block : findTextBlocks(pkg)) {
      String current = combinedText(block);
      validatePlaceholderSyntax(current);
      List<PlaceholderMatch> matches = new ArrayList<>();
      Matcher matcher = PLACEHOLDER.matcher(current);
      while (matcher.find()) {
        String key = matcher.group(1);
        if (!values.containsKey(key)) {
          throw badRequest("Thiếu giá trị cho key: " + key);
        }
        matches.add(
            new PlaceholderMatch(matcher.start(), matcher.end(), values.getOrDefault(key, "")));
      }
      matches.stream()
          .sorted(Comparator.comparingInt(PlaceholderMatch::start).reversed())
          .forEach(match -> replaceRange(block, match.start(), match.end(), match.value()));
    }
    ensureNoUnresolvedPlaceholders(pkg);
  }

  private void stripEmbeddedFonts(WordprocessingMLPackage pkg) {
    try {
      var mdp = pkg.getMainDocumentPart();
      if (mdp == null) return;
      var fontTablePart = mdp.getFontTablePart();
      if (fontTablePart != null) {
        mdp.getRelationshipsPart().removePart(fontTablePart.getPartName());
      }
    } catch (Exception ignored) {
      // Không sao — nếu không gỡ được, khối try của toHtml vẫn bắt lỗi và fallback.
    }
  }

  /** Render the DOCX to HTML after applying the same package-safety checks as generation. */
  public String toHtml(InputStream docx) {
    try {
      WordprocessingMLPackage pkg = loadSafe(docx);
      stripEmbeddedFonts(pkg);
      HTMLSettings settings = Docx4J.createHTMLSettings();
      settings.setWmlPackage(pkg);
      settings.setImageDirPath(null);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      // Non-XSL exporter (SAX) bền hơn cho file có content control (SDT), không phụ thuộc Xalan.
      Docx4J.toHTML(settings, out, Docx4J.FLAG_NONE);
      return out.toString(StandardCharsets.UTF_8);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.warn("DOCX to HTML failed", e);
      throw badRequest("Không xem trước được file Word");
    }
  }

  /**
   * Backward-compatible mapping API. Each literal must occur exactly once, which prevents the old
   * behavior from silently changing multiple legally-distinct clauses.
   */
  public byte[] applyMappings(InputStream docx, Map<String, String> textToKey) {
    List<TextMapping> mappings =
        textToKey.entrySet().stream()
            .map(entry -> new TextMapping(entry.getKey(), entry.getValue(), 1))
            .toList();
    return applyMappings(docx, mappings);
  }

  public byte[] applyMappings(InputStream docx, List<TextMapping> mappings) {
    try {
      WordprocessingMLPackage pkg = loadSafe(docx);
      validateMappings(mappings);
      List<List<Text>> blocks = findTextBlocks(pkg);

      // Validate every selection against the original package before changing any runs.
      for (TextMapping mapping : mappings) {
        int actual = countOccurrences(blocks, mapping.sampleText());
        if (actual != mapping.expectedOccurrences()) {
          throw badRequest(
              "Đoạn text cho key "
                  + mapping.fieldKey()
                  + " xuất hiện "
                  + actual
                  + " lần; yêu cầu "
                  + mapping.expectedOccurrences()
                  + " lần");
        }
      }

      for (TextMapping mapping : mappings) {
        String placeholder = "${" + mapping.fieldKey() + "}";
        int replaced = 0;
        for (List<Text> block : blocks) {
          String current = combinedText(block);
          List<Integer> positions = literalPositions(current, mapping.sampleText());
          for (int i = positions.size() - 1; i >= 0; i--) {
            int start = positions.get(i);
            replaceRange(block, start, start + mapping.sampleText().length(), placeholder);
            replaced++;
          }
        }
        if (replaced != mapping.expectedOccurrences()) {
          // Can only happen for overlapping admin selections. Fail rather than produce corruption.
          throw badRequest("Các đoạn text mapping bị chồng lấn tại key: " + mapping.fieldKey());
        }
      }
      return save(pkg);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.warn("Apply mappings failed: {}", e.getClass().getSimpleName());
      throw badRequest("Không gán được placeholder vào file");
    }
  }

  /**
   * Performs an inexpensive package validation without retaining the parsed document. Useful at
   * upload/publish boundaries.
   */
  public void validatePackage(InputStream docx) {
    try {
      loadSafe(docx);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw badRequest("File .docx không hợp lệ");
    }
  }

  private WordprocessingMLPackage loadSafe(InputStream input) throws Exception {
    byte[] bytes;
    try (input) {
      bytes = input.readNBytes(MAX_COMPRESSED_BYTES + 1);
    }
    if (bytes.length > MAX_COMPRESSED_BYTES) {
      throw badRequest("Gói DOCX vượt quá giới hạn xử lý an toàn");
    }
    inspectZip(bytes);
    return WordprocessingMLPackage.load(new ByteArrayInputStream(bytes));
  }

  private void inspectZip(byte[] archive) throws Exception {
    int entries = 0;
    long total = 0;
    boolean contentTypesFound = false;
    byte[] buffer = new byte[16 * 1024];
    try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(archive))) {
      ZipEntry entry;
      while ((entry = zip.getNextEntry()) != null) {
        entries++;
        if (entries > MAX_ZIP_ENTRIES) throw badRequest("File DOCX chứa quá nhiều thành phần");
        String name = entry.getName().replace('\\', '/');
        String lowerName = name.toLowerCase(java.util.Locale.ROOT);
        if (name.startsWith("/") || name.contains("../")) {
          throw badRequest("Đường dẫn không an toàn trong file DOCX");
        }
        if ("[content_types].xml".equals(lowerName)) contentTypesFound = true;
        if (lowerName.endsWith("vbaproject.bin")
            || lowerName.startsWith("word/embeddings/")
            || lowerName.startsWith("word/activex/")) {
          throw badRequest("File DOCX chứa macro hoặc đối tượng nhúng không được phép");
        }

        long entryBytes = 0;
        ByteArrayOutputStream relationship =
            lowerName.endsWith(".rels") ? new ByteArrayOutputStream() : null;
        int read;
        while ((read = zip.read(buffer)) != -1) {
          entryBytes += read;
          total += read;
          if (entryBytes > MAX_SINGLE_ENTRY_BYTES || total > MAX_UNCOMPRESSED_BYTES) {
            throw badRequest("File DOCX có dấu hiệu zip bomb");
          }
          if (relationship != null && entryBytes > 2L * 1024 * 1024) {
            throw badRequest("File quan hệ DOCX vượt quá giới hạn an toàn");
          }
          if (relationship != null && relationship.size() <= 2 * 1024 * 1024) {
            relationship.write(buffer, 0, read);
          }
        }
        long compressed = entry.getCompressedSize();
        if (compressed > 0 && entryBytes > 10L * 1024 * 1024 && entryBytes / compressed > 100) {
          throw badRequest("File DOCX có tỷ lệ nén không an toàn");
        }
        if (relationship != null
            && EXTERNAL_RELATIONSHIP
                .matcher(relationship.toString(StandardCharsets.UTF_8))
                .find()) {
          throw badRequest("File DOCX chứa liên kết external không được phép");
        }
        zip.closeEntry();
      }
    }
    if (!contentTypesFound || entries == 0) throw badRequest("File .docx không hợp lệ");
    if (archive.length > 0 && total > 10L * 1024 * 1024 && total / archive.length > 100) {
      throw badRequest("File DOCX có tỷ lệ nén không an toàn");
    }
  }

  private List<List<Text>> findTextBlocks(WordprocessingMLPackage pkg) throws Exception {
    List<List<Text>> result = new ArrayList<>();
    Set<P> paragraphs = java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>());
    for (var part : pkg.getParts().getParts().values()) {
      Object root;
      try {
        if (!(part instanceof org.docx4j.openpackaging.parts.JaxbXmlPart<?> jaxbPart)) continue;
        root = jaxbPart.getJaxbElement();
      } catch (Exception ignored) {
        continue;
      }
      if (root == null) continue;
      new TraversalUtil(
          XmlUtils.unwrap(root),
          new TraversalUtil.CallbackImpl() {
            @Override
            public List<Object> apply(Object object) {
              Object unwrapped = XmlUtils.unwrap(object);
              if (unwrapped instanceof P paragraph && paragraphs.add(paragraph)) {
                List<Text> texts = textNodesWithin(paragraph);
                if (!texts.isEmpty()) result.add(texts);
              }
              return null;
            }
          });
    }
    return result;
  }

  private List<Text> textNodesWithin(P paragraph) {
    List<Text> texts = new ArrayList<>();
    new TraversalUtil(
        paragraph,
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            Object unwrapped = XmlUtils.unwrap(object);
            if (unwrapped instanceof Text text) texts.add(text);
            return null;
          }
        });
    return texts;
  }

  private String combinedText(List<Text> block) {
    StringBuilder value = new StringBuilder();
    for (Text text : block) {
      if (text.getValue() != null) value.append(text.getValue());
    }
    return value.toString();
  }

  /* ===== Điều kiện (hiện/ẩn đoạn văn) ===== */

  /**
   * Xử lý đánh dấu điều kiện ở thân văn bản: các đoạn nằm giữa {@code ${if_KEY}} và {@code
   * ${endif_KEY}} chỉ được giữ khi giá trị của {@code KEY} là "đúng" (khác rỗng và khác
   * false/0/no/không/off). Marker phải nằm trên dòng riêng; hỗ trợ lồng nhau. Đoạn marker luôn bị
   * gỡ khỏi tài liệu kết quả.
   */
  private void applyConditionals(WordprocessingMLPackage pkg, Map<String, String> values) {
    Object root = XmlUtils.unwrap(pkg.getMainDocumentPart().getJaxbElement());
    if (!(root instanceof Document document) || document.getBody() == null) return;
    processConditionalContent(document.getBody().getContent(), values);
  }

  private void processConditionalContent(List<Object> content, Map<String, String> values) {
    List<Object> rebuilt = new ArrayList<>();
    Deque<Boolean> keepStack = new ArrayDeque<>();
    for (Object item : content) {
      Object node = XmlUtils.unwrap(item);
      String markerText = node instanceof P paragraph ? conditionMarkerText(paragraph) : null;
      if (markerText != null) {
        Matcher matcher = CONDITION.matcher(markerText);
        matcher.find();
        String kind = matcher.group(1);
        String base = matcher.group(2);
        if ("if".equals(kind)) {
          boolean parentKeep = keepStack.stream().allMatch(Boolean::booleanValue);
          keepStack.push(parentKeep && truthy(values.get(base)));
        } else if (!keepStack.isEmpty()) {
          keepStack.pop();
        }
        continue; // Đoạn marker không xuất hiện trong tài liệu kết quả.
      }
      if (keepStack.stream().allMatch(Boolean::booleanValue)) rebuilt.add(item);
    }
    content.clear();
    content.addAll(rebuilt);
  }

  /** Trả về text của đoạn nếu đoạn chứa marker điều kiện, ngược lại null. */
  private String conditionMarkerText(P paragraph) {
    String text = combinedText(textNodesWithin(paragraph));
    return CONDITION.matcher(text).find() ? text : null;
  }

  private static boolean truthy(String value) {
    if (value == null) return false;
    String s = value.trim().toLowerCase(Locale.ROOT);
    return !(s.isEmpty()
        || s.equals("false")
        || s.equals("0")
        || s.equals("no")
        || s.equals("n")
        || s.equals("off")
        || s.equals("không")
        || s.equals("khong"));
  }

  /* ===== Trường lặp (nhân dòng bảng) ===== */

  /**
   * Nhân dòng bảng cho các list: mỗi dòng chứa placeholder {@code ${listKey__child}} được coi là
   * DÒNG MẪU của list đó; nhân thành N dòng theo số phần tử rồi điền từng dòng. List rỗng -> bỏ
   * dòng mẫu.
   */
  private void expandListRows(
      WordprocessingMLPackage pkg, Map<String, List<Map<String, String>>> lists) throws Exception {
    if (lists.isEmpty()) return;
    List<Tbl> tables = new ArrayList<>();
    Object root = pkg.getMainDocumentPart().getJaxbElement();
    new TraversalUtil(
        XmlUtils.unwrap(root),
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            Object unwrapped = XmlUtils.unwrap(object);
            if (unwrapped instanceof Tbl table) tables.add(table);
            return null;
          }
        });
    for (Tbl tbl : tables) {
      List<Object> content = tbl.getContent();
      List<Object> rebuilt = new ArrayList<>();
      for (Object rowObj : content) {
        Object row = XmlUtils.unwrap(rowObj);
        String listKey = row instanceof Tr tr ? listKeyOfRow(tr) : null;
        if (listKey == null || !lists.containsKey(listKey)) {
          rebuilt.add(rowObj);
          continue;
        }
        for (Map<String, String> item : lists.get(listKey)) {
          Object clone = XmlUtils.deepCopy(rowObj);
          for (List<Text> block : paragraphBlocksWithin(XmlUtils.unwrap(clone))) {
            fillListRow(block, listKey, item == null ? Map.of() : item);
          }
          rebuilt.add(clone);
        }
        // List rỗng -> không thêm gì (dòng mẫu bị loại).
      }
      content.clear();
      content.addAll(rebuilt);
    }
  }

  /**
   * Key list mà một dòng bảng tham chiếu (prefix trước "__" của placeholder đầu tiên), hoặc null.
   */
  private String listKeyOfRow(Tr row) {
    for (List<Text> block : paragraphBlocksWithin(row)) {
      Matcher matcher = PLACEHOLDER.matcher(combinedText(block));
      while (matcher.find()) {
        int sep = matcher.group(1).indexOf("__");
        if (sep > 0) return matcher.group(1).substring(0, sep);
      }
    }
    return null;
  }

  /** Các block text (theo paragraph) nằm trong một node bất kỳ (vd một dòng bảng đã clone). */
  private List<List<Text>> paragraphBlocksWithin(Object node) {
    List<List<Text>> result = new ArrayList<>();
    Set<P> seen = java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>());
    new TraversalUtil(
        node,
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            Object unwrapped = XmlUtils.unwrap(object);
            if (unwrapped instanceof P paragraph && seen.add(paragraph)) {
              List<Text> texts = textNodesWithin(paragraph);
              if (!texts.isEmpty()) result.add(texts);
            }
            return null;
          }
        });
    return result;
  }

  /** Điền mọi placeholder {@code ${listKey__child}} trong block bằng giá trị của phần tử list. */
  private void fillListRow(List<Text> block, String listKey, Map<String, String> item) {
    String current = combinedText(block);
    if (!current.contains("${")) return;
    String prefix = listKey + "__";
    List<PlaceholderMatch> matches = new ArrayList<>();
    Matcher matcher = PLACEHOLDER.matcher(current);
    while (matcher.find()) {
      String key = matcher.group(1);
      if (key.startsWith(prefix)) {
        String child = key.substring(prefix.length());
        matches.add(
            new PlaceholderMatch(matcher.start(), matcher.end(), item.getOrDefault(child, "")));
      }
    }
    matches.stream()
        .sorted(Comparator.comparingInt(PlaceholderMatch::start).reversed())
        .forEach(match -> replaceRange(block, match.start(), match.end(), match.value()));
  }

  private void validatePlaceholderSyntax(String value) {
    if (value == null || !value.contains("${")) return;
    Matcher like = PLACEHOLDER_LIKE.matcher(value);
    int cursor = 0;
    while (like.find()) {
      int marker = value.indexOf("${", cursor);
      if (marker >= 0 && marker != like.start()) {
        throw badRequest("Placeholder không hợp lệ trong file mẫu");
      }
      if (!PLACEHOLDER.matcher(like.group()).matches()) {
        throw badRequest("Placeholder không hợp lệ: " + like.group());
      }
      cursor = like.end();
    }
    if (value.indexOf("${", cursor) >= 0) {
      throw badRequest("Placeholder chưa đóng hoặc không hợp lệ trong file mẫu");
    }
  }

  private void validateMappings(List<TextMapping> mappings) {
    if (mappings == null || mappings.isEmpty()) throw badRequest("Danh sách mapping là bắt buộc");
    Set<String> keys = new LinkedHashSet<>();
    Set<String> samples = new LinkedHashSet<>();
    for (TextMapping mapping : mappings) {
      if (mapping.sampleText() == null || mapping.sampleText().isBlank()) {
        throw badRequest("Đoạn text mapping không được để trống");
      }
      if (mapping.sampleText().contains("${")) {
        throw badRequest("Không thể mapping một placeholder đã tồn tại");
      }
      if (mapping.fieldKey() == null || !mapping.fieldKey().matches("[A-Za-z][A-Za-z0-9_]{0,63}")) {
        throw badRequest("Key không hợp lệ: " + mapping.fieldKey());
      }
      if (mapping.expectedOccurrences() < 1 || mapping.expectedOccurrences() > 100) {
        throw badRequest("Số lần xuất hiện không hợp lệ cho key: " + mapping.fieldKey());
      }
      if (!keys.add(mapping.fieldKey())) throw badRequest("Key bị trùng: " + mapping.fieldKey());
      if (!samples.add(mapping.sampleText())) {
        throw badRequest("Đoạn text mapping bị trùng tại key: " + mapping.fieldKey());
      }
    }
    List<String> sampleList = new ArrayList<>(samples);
    for (int i = 0; i < sampleList.size(); i++) {
      for (int j = i + 1; j < sampleList.size(); j++) {
        if (sampleList.get(i).contains(sampleList.get(j))
            || sampleList.get(j).contains(sampleList.get(i))) {
          throw badRequest("Các đoạn text mapping không được chứa/chồng lấn nhau");
        }
      }
    }
  }

  private int countOccurrences(List<List<Text>> blocks, String literal) {
    return blocks.stream()
        .mapToInt(block -> literalPositions(combinedText(block), literal).size())
        .sum();
  }

  private List<Integer> literalPositions(String value, String literal) {
    List<Integer> result = new ArrayList<>();
    int from = 0;
    while (from <= value.length() - literal.length()) {
      int index = value.indexOf(literal, from);
      if (index < 0) break;
      result.add(index);
      from = index + literal.length();
    }
    return result;
  }

  private void replaceRange(List<Text> texts, int start, int end, String replacement) {
    if (start < 0 || end <= start) return;
    int cursor = 0;
    int first = -1;
    int last = -1;
    int firstOffset = 0;
    int lastOffset = 0;
    for (int i = 0; i < texts.size(); i++) {
      String value = texts.get(i).getValue() == null ? "" : texts.get(i).getValue();
      int next = cursor + value.length();
      if (first < 0 && start < next) {
        first = i;
        firstOffset = start - cursor;
      }
      if (first >= 0 && end <= next) {
        last = i;
        lastOffset = end - cursor;
        break;
      }
      cursor = next;
    }
    if (first < 0 || last < 0) {
      throw new IllegalStateException("Text range is outside the paragraph");
    }

    Text firstText = texts.get(first);
    String firstValue = firstText.getValue() == null ? "" : firstText.getValue();
    if (first == last) {
      firstText.setValue(
          firstValue.substring(0, firstOffset) + replacement + firstValue.substring(lastOffset));
      firstText.setSpace("preserve");
      return;
    }

    firstText.setValue(firstValue.substring(0, firstOffset) + replacement);
    firstText.setSpace("preserve");
    for (int i = first + 1; i < last; i++) {
      texts.get(i).setValue("");
    }
    Text lastText = texts.get(last);
    String lastValue = lastText.getValue() == null ? "" : lastText.getValue();
    lastText.setValue(lastValue.substring(lastOffset));
    lastText.setSpace("preserve");
  }

  private void ensureNoUnresolvedPlaceholders(WordprocessingMLPackage pkg) throws Exception {
    for (List<Text> block : findTextBlocks(pkg)) {
      String value = combinedText(block);
      validatePlaceholderSyntax(value);
      if (value.contains("${")) {
        throw badRequest("File sau khi tạo vẫn còn placeholder chưa được thay");
      }
    }
  }

  private byte[] save(WordprocessingMLPackage pkg) throws Exception {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    pkg.save(out);
    return out.toByteArray();
  }

  private ResponseStatusException badRequest(String reason) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
  }

  private record PlaceholderMatch(int start, int end, String value) {}
}

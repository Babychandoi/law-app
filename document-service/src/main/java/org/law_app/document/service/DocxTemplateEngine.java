package org.law_app.document.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.docx4j.Docx4J;
import org.docx4j.TraversalUtil;
import org.docx4j.XmlUtils;
import org.docx4j.convert.out.HTMLSettings;
import org.docx4j.model.datastorage.migration.VariablePrepare;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.Text;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
public class DocxTemplateEngine {

  public static final String DOCX_CONTENT_TYPE =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  private static final Pattern PLACEHOLDER =
      Pattern.compile("\\$\\{([A-Za-z][A-Za-z0-9_]{0,63})\\}");
  private static final Pattern MALFORMED_PLACEHOLDER = Pattern.compile("\\$\\{([^}]*)\\}");

  public Set<String> extractPlaceholders(InputStream docx) {
    try {
      WordprocessingMLPackage pkg = WordprocessingMLPackage.load(docx);
      VariablePrepare.prepare(pkg);
      Set<String> keys = new LinkedHashSet<>();
      for (Text text : findTextNodes(pkg)) {
        String value = text.getValue();
        if (value == null) continue;
        validateMalformedPlaceholders(value);
        Matcher matcher = PLACEHOLDER.matcher(value);
        while (matcher.find()) {
          keys.add(matcher.group(1));
        }
      }
      return keys;
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error("DOCX placeholder extraction failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đọc được file Word mẫu");
    }
  }

  public byte[] render(InputStream docx, Map<String, String> values) {
    try {
      WordprocessingMLPackage pkg = WordprocessingMLPackage.load(docx);
      VariablePrepare.prepare(pkg);
      for (Text text : findTextNodes(pkg)) {
        String current = text.getValue();
        if (current == null || !current.contains("${")) continue;
        validateMalformedPlaceholders(current);
        String replaced = replacePlaceholders(current, values);
        text.setValue(replaced);
      }
      ensureNoUnresolvedPlaceholders(pkg);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      pkg.save(out);
      return out.toByteArray();
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error("DOCX render failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được file Word");
    }
  }

  /** Render the .docx to standalone HTML so the admin can preview it before mapping keys. */
  public String toHtml(InputStream docx) {
    try {
      WordprocessingMLPackage pkg = WordprocessingMLPackage.load(docx);
      HTMLSettings settings = Docx4J.createHTMLSettings();
      settings.setWmlPackage(pkg);
      settings.setImageDirPath(null);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      Docx4J.toHTML(settings, out, Docx4J.FLAG_EXPORT_PREFER_XSL);
      return out.toString(java.nio.charset.StandardCharsets.UTF_8);
    } catch (Exception e) {
      log.error("DOCX to HTML failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không xem trước được file Word");
    }
  }

  /**
   * Replace literal sample text occurrences with {@code ${key}} placeholders, keeping the run that
   * holds the text (so font/size/style is preserved). Returns the new .docx bytes. Each mapping
   * maps the exact sample text the admin typed to a placeholder key. A key whose sample text is not
   * found inside a single run is reported so the admin can adjust it.
   */
  public byte[] applyMappings(InputStream docx, Map<String, String> textToKey) {
    try {
      WordprocessingMLPackage pkg = WordprocessingMLPackage.load(docx);
      Set<String> matched = new LinkedHashSet<>();
      for (Text text : findTextNodes(pkg)) {
        String value = text.getValue();
        if (value == null || value.isEmpty()) continue;
        boolean changed = false;
        for (Map.Entry<String, String> entry : textToKey.entrySet()) {
          String sample = entry.getKey();
          if (sample == null || sample.isEmpty()) continue;
          if (value.contains(sample)) {
            value = value.replace(sample, "${" + entry.getValue() + "}");
            matched.add(entry.getValue());
            changed = true;
          }
        }
        if (changed) {
          text.setValue(value);
          text.setSpace("preserve");
        }
      }
      Set<String> notFound = new LinkedHashSet<>();
      for (String key : textToKey.values()) {
        if (!matched.contains(key)) notFound.add(key);
      }
      if (!notFound.isEmpty()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Không tìm thấy đoạn text cho key: "
                + String.join(", ", notFound)
                + " (đoạn text phải nằm liền trong file, sao chép đúng từ bản xem trước)");
      }
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      pkg.save(out);
      return out.toByteArray();
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error("Apply mappings failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Không gán được placeholder vào file");
    }
  }

  private Set<Text> findTextNodes(WordprocessingMLPackage pkg) throws Exception {
    Set<Text> result = new LinkedHashSet<>();
    for (var part : pkg.getParts().getParts().values()) {
      Object jaxbElement = null;
      try {
        if (part instanceof org.docx4j.openpackaging.parts.JaxbXmlPart<?> jaxbPart) {
          jaxbElement = jaxbPart.getJaxbElement();
        }
      } catch (Exception e) {
        continue;
      }
      if (jaxbElement == null) continue;
      new TraversalUtil(
          XmlUtils.unwrap(jaxbElement),
          new TraversalUtil.CallbackImpl() {
            @Override
            public java.util.List<Object> apply(Object o) {
              Object unwrapped = XmlUtils.unwrap(o);
              if (unwrapped instanceof Text text) {
                result.add(text);
              }
              return null;
            }
          });
    }
    return result;
  }

  private void validateMalformedPlaceholders(String value) {
    Matcher malformed = MALFORMED_PLACEHOLDER.matcher(value);
    while (malformed.find()) {
      String key = malformed.group(1);
      if (!key.matches("[A-Za-z][A-Za-z0-9_]{0,63}")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Placeholder không hợp lệ: ${" + key + "}");
      }
    }
  }

  private String replacePlaceholders(String current, Map<String, String> values) {
    Matcher matcher = PLACEHOLDER.matcher(current);
    StringBuffer buffer = new StringBuffer();
    while (matcher.find()) {
      String key = matcher.group(1);
      if (!values.containsKey(key)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu giá trị cho key: " + key);
      }
      matcher.appendReplacement(buffer, Matcher.quoteReplacement(values.getOrDefault(key, "")));
    }
    matcher.appendTail(buffer);
    return buffer.toString();
  }

  private void ensureNoUnresolvedPlaceholders(WordprocessingMLPackage pkg) throws Exception {
    for (Text text : findTextNodes(pkg)) {
      String value = text.getValue();
      if (value != null && value.contains("${")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "File sau khi tạo vẫn còn placeholder chưa được thay");
      }
    }
  }
}

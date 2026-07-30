package org.law_app.document.service;

import java.math.BigDecimal;
import java.math.BigInteger;

/**
 * Đọc số nguyên (không âm) thành chữ tiếng Việt — dùng cho placeholder dẫn xuất "số tiền bằng chữ".
 *
 * <p>Với field NUMBER/CURRENCY có key {@code K}, engine cho phép template dùng thêm placeholder
 * {@code K_bangchu} và tự điền giá trị đọc bằng chữ khi tạo tài liệu. Ví dụ: 1.200.000 → "một triệu
 * hai trăm nghìn". Người soạn tự thêm đơn vị (vd " đồng") trong DOCX.
 */
public final class VietnameseNumberWords {

  /** Hậu tố placeholder dẫn xuất cho giá trị đọc bằng chữ. */
  public static final String SUFFIX = "_bangchu";

  private static final String[] DIGITS = {
    "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"
  };
  // Đơn vị nhóm 3 chữ số: đơn vị, nghìn, triệu, tỷ, nghìn tỷ, triệu tỷ...
  private static final String[] SCALES = {"", " nghìn", " triệu", " tỷ"};

  private VietnameseNumberWords() {}

  /** Key dẫn xuất của một field, vd "totalAmount" -> "totalAmount_bangchu". */
  public static String derivedKey(String baseKey) {
    return baseKey + SUFFIX;
  }

  /**
   * Đọc phần nguyên của số thành chữ tiếng Việt. Chuỗi rỗng/không parse được -> "". Số âm -> có
   * tiền tố "âm". Phần thập phân bị bỏ qua (tài liệu pháp lý VND thường là số nguyên).
   */
  public static String toWords(String raw) {
    if (raw == null) return "";
    String s = raw.trim();
    if (s.isEmpty()) return "";
    // Cho phép định dạng có dấu phân cách: "1.200.000", "1,200,000", "1200000.00".
    boolean negative = s.startsWith("-");
    try {
      BigDecimal dec = new BigDecimal(normalizeNumber(s));
      BigInteger intPart = dec.toBigInteger().abs();
      String words = toWords(intPart);
      return negative && intPart.signum() != 0 ? "âm " + words : words;
    } catch (NumberFormatException e) {
      return "";
    }
  }

  private static String normalizeNumber(String s) {
    String t = s.replace(" ", "");
    // Nếu có cả '.' và ',' -> coi ',' là thập phân, '.' là phân cách nghìn (kiểu VN).
    if (t.contains(".") && t.contains(",")) {
      t = t.replace(".", "").replace(",", ".");
    } else if (t.chars().filter(c -> c == '.').count() > 1) {
      // Nhiều dấu '.' -> đều là phân cách nghìn.
      t = t.replace(".", "");
    } else if (t.chars().filter(c -> c == ',').count() >= 1 && !t.contains(".")) {
      // Chỉ có ',' -> phân cách nghìn kiểu Anh (bỏ), trừ khi là thập phân đơn giản.
      long commas = t.chars().filter(c -> c == ',').count();
      if (commas > 1 || t.indexOf(',') < t.length() - 3) t = t.replace(",", "");
      else t = t.replace(",", ".");
    }
    return t;
  }

  /** Đọc một BigInteger không âm thành chữ. */
  public static String toWords(BigInteger n) {
    if (n.signum() == 0) return "không";
    if (n.signum() < 0) return "âm " + toWords(n.abs());

    // Tách thành các nhóm 3 chữ số từ phải sang.
    java.util.List<Integer> groups = new java.util.ArrayList<>();
    BigInteger thousand = BigInteger.valueOf(1000);
    BigInteger cur = n;
    while (cur.signum() > 0) {
      groups.add(cur.mod(thousand).intValue());
      cur = cur.divide(thousand);
    }

    StringBuilder sb = new StringBuilder();
    for (int i = groups.size() - 1; i >= 0; i--) {
      int g = groups.get(i);
      if (g == 0) continue;
      boolean highest = sb.length() == 0;
      sb.append(threeDigits(g, !highest));
      String scale = i < SCALES.length ? SCALES[i] : scaleFor(i);
      sb.append(scale);
      if (i > 0) sb.append(" ");
    }
    return sb.toString().trim().replaceAll("\\s+", " ");
  }

  /**
   * Đơn vị cho nhóm thứ i > 3: lặp "tỷ" (tỷ, nghìn tỷ, triệu tỷ, tỷ tỷ...). Đơn giản hoá: " tỷ" *
   * k.
   */
  private static String scaleFor(int i) {
    // i>=4: mỗi 3 bậc trên "tỷ" lặp lại chu kỳ nghìn/triệu/tỷ. Đủ dùng cho số rất lớn.
    int over = i - 3;
    String base = SCALES[over % 3 + 0]; // "", nghìn, triệu
    int tyCount = over / 3 + 1;
    StringBuilder ty = new StringBuilder();
    for (int k = 0; k < tyCount; k++) ty.append(" tỷ");
    return ty + base;
  }

  /**
   * Đọc nhóm 3 chữ số. {@code full}=true thì đọc đủ "không trăm/linh" cho nhóm không phải cao nhất.
   */
  private static String threeDigits(int num, boolean full) {
    int hundreds = num / 100;
    int tens = (num % 100) / 10;
    int units = num % 10;
    StringBuilder sb = new StringBuilder();

    if (hundreds > 0 || full) {
      sb.append(DIGITS[hundreds]).append(" trăm");
    }
    if (tens == 0) {
      if (units > 0) {
        if (hundreds > 0 || full) sb.append(" linh");
        sb.append(" ").append(DIGITS[units]);
      }
    } else if (tens == 1) {
      sb.append(" mười");
      if (units == 5) sb.append(" lăm");
      else if (units > 0) sb.append(" ").append(DIGITS[units]);
    } else {
      sb.append(" ").append(DIGITS[tens]).append(" mươi");
      if (units == 1) sb.append(" mốt");
      else if (units == 5) sb.append(" lăm");
      else if (units > 0) sb.append(" ").append(DIGITS[units]);
    }
    return sb.toString().trim();
  }
}

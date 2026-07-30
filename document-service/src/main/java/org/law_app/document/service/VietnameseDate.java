package org.law_app.document.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Định dạng ngày kiểu văn bản pháp lý tiếng Việt cho placeholder dẫn xuất {@code {key}_vi}: field
 * DATE (ISO yyyy-MM-dd) → "ngày DD tháng MM năm YYYY". Chuỗi rỗng/không hợp lệ → "".
 */
public final class VietnameseDate {

  /** Hậu tố placeholder dẫn xuất cho ngày định dạng tiếng Việt. */
  public static final String SUFFIX = "_vi";

  private VietnameseDate() {}

  public static String derivedKey(String baseKey) {
    return baseKey + SUFFIX;
  }

  public static String format(String isoDate) {
    if (isoDate == null) return "";
    String s = isoDate.trim();
    if (s.isEmpty()) return "";
    try {
      LocalDate d = LocalDate.parse(s);
      return String.format(
          "ngày %02d tháng %02d năm %04d", d.getDayOfMonth(), d.getMonthValue(), d.getYear());
    } catch (DateTimeParseException e) {
      return "";
    }
  }
}

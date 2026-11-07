package org.law_app.document.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateField;

/**
 * Placeholder DẪN XUẤT: với field NUMBER/CURRENCY có key {@code K}, template được phép dùng thêm
 * {@code K_bangchu} và hệ thống tự điền giá trị đọc bằng chữ khi tạo tài liệu (số tiền bằng chữ).
 * Dùng chung cho luồng publish-validation (cho phép placeholder này) và luồng generate (điền giá
 * trị).
 */
public final class DocumentDerivedValues {

  private DocumentDerivedValues() {}

  private static final BigDecimal DEFAULT_VAT_RATE = BigDecimal.TEN; // 10% VAT phổ biến ở VN

  private static boolean isNumeric(DocumentFieldInputType t) {
    return t == DocumentFieldInputType.NUMBER || t == DocumentFieldInputType.CURRENCY;
  }

  /**
   * Tập key dẫn xuất được phép: {key}_bangchu cho NUMBER/CURRENCY, {key}_vi cho DATE, và với
   * CURRENCY thêm {key}_vat / {key}_total / {key}_total_bangchu / {key}_vatrate (tự tính
   * phí/VAT/tổng).
   */
  public static Set<String> allowedDerivedKeys(List<DocumentTemplateField> fields) {
    Set<String> out = new LinkedHashSet<>();
    if (fields == null) return out;
    for (DocumentTemplateField f : fields) {
      if (f == null || f.getFieldKey() == null) continue;
      String key = f.getFieldKey();
      if (isNumeric(f.getInputType())) {
        out.add(VietnameseNumberWords.derivedKey(key));
      }
      if (f.getInputType() == DocumentFieldInputType.CURRENCY) {
        out.add(key + "_vat");
        out.add(key + "_total");
        out.add(key + "_total_bangchu");
        out.add(key + "_vatrate");
      }
      if (f.getInputType() == DocumentFieldInputType.DATE) {
        out.add(VietnameseDate.derivedKey(key));
      }
    }
    return out;
  }

  /** Bản sao {@code values} có thêm các key dẫn xuất (bằng chữ + phí/VAT/tổng cho CURRENCY). */
  public static Map<String, String> augment(
      List<DocumentTemplateField> fields, Map<String, String> values) {
    Map<String, String> out = new LinkedHashMap<>(values == null ? Map.of() : values);
    if (fields == null) return out;
    for (DocumentTemplateField f : fields) {
      if (f == null || f.getFieldKey() == null) continue;
      String key = f.getFieldKey();
      // Luôn thêm key dẫn xuất để placeholder luôn resolve được (rỗng nếu chưa nhập).
      if (isNumeric(f.getInputType())) {
        out.put(VietnameseNumberWords.derivedKey(key), VietnameseNumberWords.toWords(out.get(key)));
      }
      if (f.getInputType() == DocumentFieldInputType.CURRENCY) {
        augmentCurrency(out, key);
      }
      if (f.getInputType() == DocumentFieldInputType.DATE) {
        out.put(VietnameseDate.derivedKey(key), VietnameseDate.format(out.get(key)));
      }
    }
    return out;
  }

  /** Tính phí/VAT/tổng cho một field CURRENCY; rate mặc định 10%, ghi đè bởi {key}_vatrate. */
  private static void augmentCurrency(Map<String, String> out, String key) {
    BigDecimal base = parseMoney(out.get(key));
    BigDecimal rate = parseRate(out.get(key + "_vatrate"));
    // Luôn trả về rate đã dùng (để có thể in ${key_vatrate}); mặc định 10.
    out.put(key + "_vatrate", rate.stripTrailingZeros().toPlainString());
    if (base == null) {
      out.putIfAbsent(key + "_vat", "");
      out.putIfAbsent(key + "_total", "");
      out.putIfAbsent(key + "_total_bangchu", "");
      return;
    }
    BigDecimal vat =
        base.multiply(rate).divide(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP);
    BigDecimal total = base.add(vat);
    out.put(key + "_vat", formatMoney(vat));
    out.put(key + "_total", formatMoney(total));
    out.put(key + "_total_bangchu", VietnameseNumberWords.toWords(total.toBigInteger().toString()));
  }

  private static BigDecimal parseMoney(String raw) {
    if (raw == null || raw.isBlank()) return null;
    String digits = raw.replaceAll("[^0-9-]", "");
    if (digits.isEmpty() || digits.equals("-")) return null;
    try {
      return new BigDecimal(digits);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private static BigDecimal parseRate(String raw) {
    if (raw == null || raw.isBlank()) return DEFAULT_VAT_RATE;
    try {
      BigDecimal rate = new BigDecimal(raw.trim().replace("%", "").replace(",", "."));
      return rate.signum() < 0 ? DEFAULT_VAT_RATE : rate;
    } catch (NumberFormatException e) {
      return DEFAULT_VAT_RATE;
    }
  }

  private static String formatMoney(BigDecimal amount) {
    DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.ROOT);
    symbols.setGroupingSeparator('.');
    return new DecimalFormat("#,##0", symbols).format(amount);
  }
}

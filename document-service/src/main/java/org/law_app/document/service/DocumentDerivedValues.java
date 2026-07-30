package org.law_app.document.service;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
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

  private static boolean isNumeric(DocumentFieldInputType t) {
    return t == DocumentFieldInputType.NUMBER || t == DocumentFieldInputType.CURRENCY;
  }

  /** Tập key dẫn xuất được phép ({key}_bangchu) dựa trên các field NUMBER/CURRENCY. */
  public static Set<String> allowedDerivedKeys(List<DocumentTemplateField> fields) {
    Set<String> out = new LinkedHashSet<>();
    if (fields == null) return out;
    for (DocumentTemplateField f : fields) {
      if (f != null && isNumeric(f.getInputType()) && f.getFieldKey() != null) {
        out.add(VietnameseNumberWords.derivedKey(f.getFieldKey()));
      }
    }
    return out;
  }

  /** Bản sao {@code values} có thêm {key}_bangchu cho mỗi field số có giá trị. */
  public static Map<String, String> augment(
      List<DocumentTemplateField> fields, Map<String, String> values) {
    Map<String, String> out = new LinkedHashMap<>(values == null ? Map.of() : values);
    if (fields == null) return out;
    for (DocumentTemplateField f : fields) {
      if (f == null || !isNumeric(f.getInputType()) || f.getFieldKey() == null) continue;
      // Luôn thêm key dẫn xuất để placeholder {key}_bangchu luôn resolve được (rỗng nếu chưa nhập).
      out.put(
          VietnameseNumberWords.derivedKey(f.getFieldKey()),
          VietnameseNumberWords.toWords(out.get(f.getFieldKey())));
    }
    return out;
  }
}

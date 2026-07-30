package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateField;

class DocumentDerivedValuesTest {

  private DocumentTemplateField field(String key, DocumentFieldInputType type) {
    return DocumentTemplateField.builder().fieldKey(key).inputType(type).build();
  }

  @Test
  void allowedDerivedKeysCoverOnlyNumericFields() {
    List<DocumentTemplateField> fields =
        List.of(
            field("customerName", DocumentFieldInputType.TEXT),
            field("totalAmount", DocumentFieldInputType.CURRENCY),
            field("quantity", DocumentFieldInputType.NUMBER));
    assertThat(DocumentDerivedValues.allowedDerivedKeys(fields))
        .containsExactlyInAnyOrder("totalAmount_bangchu", "quantity_bangchu");
  }

  @Test
  void augmentAddsWordsForNumericFields() {
    List<DocumentTemplateField> fields =
        List.of(
            field("customerName", DocumentFieldInputType.TEXT),
            field("totalAmount", DocumentFieldInputType.CURRENCY));
    Map<String, String> out =
        DocumentDerivedValues.augment(
            fields, Map.of("customerName", "Nguyễn Văn A", "totalAmount", "1200000"));
    assertThat(out).containsEntry("totalAmount_bangchu", "một triệu hai trăm nghìn");
    // Không sinh key dẫn xuất cho field text.
    assertThat(out).doesNotContainKey("customerName_bangchu");
  }

  @Test
  void augmentAlwaysAddsDerivedKeyEvenWhenBlank() {
    List<DocumentTemplateField> fields = List.of(field("fee", DocumentFieldInputType.NUMBER));
    Map<String, String> out = DocumentDerivedValues.augment(fields, Map.of());
    assertThat(out).containsEntry("fee_bangchu", "");
  }

  @Test
  void augmentAddsVietnameseDateForDateFields() {
    List<DocumentTemplateField> fields = List.of(field("signDate", DocumentFieldInputType.DATE));
    assertThat(DocumentDerivedValues.allowedDerivedKeys(fields)).containsExactly("signDate_vi");
    Map<String, String> out =
        DocumentDerivedValues.augment(fields, Map.of("signDate", "2026-07-05"));
    assertThat(out).containsEntry("signDate_vi", "ngày 05 tháng 07 năm 2026");
  }
}

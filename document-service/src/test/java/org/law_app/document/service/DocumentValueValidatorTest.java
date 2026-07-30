package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateField;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class DocumentValueValidatorTest {
  private final DocumentValueValidator validator = new DocumentValueValidator();

  @Test
  void normalizesDatesNumbersAndSelectValues() {
    List<DocumentTemplateField> fields =
        List.of(
            field("signedAt", DocumentFieldInputType.DATE, 1),
            DocumentTemplateField.builder()
                .fieldKey("fee")
                .label("Phí")
                .inputType(DocumentFieldInputType.CURRENCY)
                .required(true)
                .sortOrder(2)
                .minimum(BigDecimal.ZERO)
                .maximum(BigDecimal.valueOf(1_000_000))
                .build(),
            DocumentTemplateField.builder()
                .fieldKey("filingType")
                .label("Loại đơn")
                .inputType(DocumentFieldInputType.SELECT)
                .required(true)
                .sortOrder(3)
                .options(List.of("Nhãn hiệu", "Sáng chế"))
                .build());

    validator.validateSchema(fields);
    assertThat(
            validator.normalizeAndValidate(
                fields,
                Map.of("signedAt", "2026-07-29", "fee", "12000.00", "filingType", "Nhãn hiệu")))
        .containsEntry("signedAt", "2026-07-29")
        .containsEntry("fee", "12000")
        .containsEntry("filingType", "Nhãn hiệu");
  }

  @Test
  void rejectsInvalidTypedValuesAndUnsafeSchema() {
    DocumentTemplateField date = field("signedAt", DocumentFieldInputType.DATE, 1);
    assertBadRequest(
        () -> validator.normalizeAndValidate(List.of(date), Map.of("signedAt", "29/07/2026")));

    DocumentTemplateField percent =
        DocumentTemplateField.builder()
            .fieldKey("vat")
            .label("VAT")
            .inputType(DocumentFieldInputType.PERCENT)
            .required(true)
            .sortOrder(1)
            .build();
    assertBadRequest(() -> validator.normalizeAndValidate(List.of(percent), Map.of("vat", "101")));

    DocumentTemplateField unsafeRegex =
        DocumentTemplateField.builder()
            .fieldKey("name")
            .label("Tên")
            .inputType(DocumentFieldInputType.TEXT)
            .required(true)
            .sortOrder(1)
            .validationPattern("(a+)+")
            .build();
    assertBadRequest(() -> validator.validateSchema(List.of(unsafeRegex)));
  }

  @Test
  void appliesDefaultsAndRejectsUnknownKeys() {
    DocumentTemplateField field =
        DocumentTemplateField.builder()
            .fieldKey("country")
            .label("Quốc gia")
            .inputType(DocumentFieldInputType.TEXT)
            .required(true)
            .sortOrder(1)
            .defaultValue("Việt Nam")
            .maxLength(100)
            .build();
    assertThat(validator.normalizeAndValidate(List.of(field), Map.of()))
        .containsEntry("country", "Việt Nam");
    assertBadRequest(
        () ->
            validator.normalizeAndValidate(
                List.of(field), Map.of("country", "Việt Nam", "unknown", "PII")));
  }

  private DocumentTemplateField field(String key, DocumentFieldInputType type, int order) {
    return DocumentTemplateField.builder()
        .fieldKey(key)
        .label(key)
        .inputType(type)
        .required(true)
        .sortOrder(order)
        .build();
  }

  private void assertBadRequest(org.assertj.core.api.ThrowableAssert.ThrowingCallable callable) {
    assertThatThrownBy(callable)
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
  }
}

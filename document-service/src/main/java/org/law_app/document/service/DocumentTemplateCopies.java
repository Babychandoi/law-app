package org.law_app.document.service;

import java.util.List;
import org.law_app.document.domain.DocumentTemplateField;

/** Defensive deep-copy helpers for content stored in immutable version documents. */
final class DocumentTemplateCopies {
  private DocumentTemplateCopies() {}

  static List<DocumentTemplateField> fields(List<DocumentTemplateField> source) {
    if (source == null) return List.of();
    return source.stream()
        .map(
            field ->
                DocumentTemplateField.builder()
                    .fieldKey(field.getFieldKey())
                    .label(field.getLabel())
                    .helpText(field.getHelpText())
                    .inputType(field.getInputType())
                    .required(field.isRequired())
                    .sortOrder(field.getSortOrder())
                    .defaultValue(field.getDefaultValue())
                    .maxLength(field.getMaxLength())
                    .validationPattern(field.getValidationPattern())
                    .minimum(field.getMinimum())
                    .maximum(field.getMaximum())
                    .options(
                        field.getOptions() == null ? List.of() : List.copyOf(field.getOptions()))
                    .dataClassification(field.getDataClassification())
                    .build())
        .toList();
  }
}

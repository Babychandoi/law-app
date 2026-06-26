package org.law_app.document.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplateField {
  @NotBlank private String fieldKey;
  private String label;
  private String helpText;
  @Builder.Default @NotNull private DocumentFieldInputType inputType = DocumentFieldInputType.TEXT;
  @Builder.Default private boolean required = true;
  @Builder.Default private int sortOrder = 0;
  private String defaultValue;
}

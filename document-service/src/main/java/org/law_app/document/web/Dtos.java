package org.law_app.document.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateStatus;

public final class Dtos {
  private Dtos() {}

  public record TemplateFieldRequest(
      @NotBlank String fieldKey,
      @NotBlank String label,
      String helpText,
      @NotNull DocumentFieldInputType inputType,
      boolean required,
      int sortOrder,
      String defaultValue) {}

  public record UpdateFieldsRequest(@Valid @NotEmpty List<TemplateFieldRequest> fields) {}

  /** One sample-text → placeholder mapping the admin defines on the preview. */
  public record MappingRequest(
      @NotBlank String sampleText,
      @NotBlank String fieldKey,
      @NotBlank String label,
      String helpText,
      @NotNull DocumentFieldInputType inputType,
      boolean required,
      int sortOrder,
      String defaultValue) {}

  public record ApplyMappingsRequest(@Valid @NotEmpty List<MappingRequest> mappings) {}

  public record TemplatePreviewResponse(String id, String name, String html) {}

  public record GenerateDocumentRequest(@NotNull Map<String, String> values) {}

  public record TemplateFieldResponse(
      String fieldKey,
      String label,
      String helpText,
      DocumentFieldInputType inputType,
      boolean required,
      int sortOrder,
      String defaultValue) {}

  public record DocumentTemplateResponse(
      String id,
      String name,
      String description,
      DocumentTemplateStatus status,
      int version,
      String originalFileName,
      long fileSize,
      List<TemplateFieldResponse> fields,
      String createdByUserId,
      Instant createdAt,
      Instant updatedAt) {}

  public record GeneratedDocumentResponse(
      String id,
      String templateId,
      String templateName,
      int templateVersion,
      String fileName,
      String downloadUrl,
      String createdByUserId,
      Instant createdAt) {}
}

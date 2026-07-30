package org.law_app.document.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.law_app.document.domain.DataClassification;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentWorkflowStatus;

public final class Dtos {
  private Dtos() {}

  public record TemplateFieldRequest(
      @NotBlank
          @Pattern(
              regexp = "[A-Za-z][A-Za-z0-9_]{0,63}",
              message = "Key must start with a letter and contain only letters, numbers or _")
          String fieldKey,
      @NotBlank @Size(max = 200) String label,
      @Size(max = 1000) String helpText,
      @NotNull DocumentFieldInputType inputType,
      boolean required,
      @Min(0) @Max(10_000) int sortOrder,
      @Size(max = 20_000) String defaultValue,
      @Min(1) @Max(100_000) Integer maxLength,
      @Size(max = 500) String validationPattern,
      BigDecimal minimum,
      BigDecimal maximum,
      @Size(max = 500) List<@NotBlank @Size(max = 500) String> options,
      DataClassification dataClassification) {}

  public record UpdateFieldsRequest(
      @Valid @NotEmpty @Size(max = 500) List<TemplateFieldRequest> fields,
      @Size(max = 500) String changeReason,
      Long expectedRevision) {}

  /** One exact sample-text to placeholder mapping the admin defines on the preview. */
  public record MappingRequest(
      @NotBlank @Size(max = 20_000) String sampleText,
      @NotBlank
          @Pattern(
              regexp = "[A-Za-z][A-Za-z0-9_]{0,63}",
              message = "Key must start with a letter and contain only letters, numbers or _")
          String fieldKey,
      @NotBlank @Size(max = 200) String label,
      @Size(max = 1000) String helpText,
      @NotNull DocumentFieldInputType inputType,
      boolean required,
      @Min(0) @Max(10_000) int sortOrder,
      @Size(max = 20_000) String defaultValue,
      @Min(1) @Max(100_000) Integer maxLength,
      @Size(max = 500) String validationPattern,
      BigDecimal minimum,
      BigDecimal maximum,
      @Size(max = 500) List<@NotBlank @Size(max = 500) String> options,
      DataClassification dataClassification,
      @Min(1) @Max(100) Integer expectedOccurrences) {}

  public record ApplyMappingsRequest(
      @Valid @NotEmpty @Size(max = 500) List<MappingRequest> mappings,
      @Size(max = 500) String changeReason,
      Long expectedRevision) {}

  /**
   * Atomic save-and-publish payload. Sending the current editor state here prevents the traditional
   * "publish before save" data-loss bug. The payload remains optional for the legacy endpoint.
   */
  public record PublishTemplateRequest(
      @Valid @Size(min = 1, max = 500) List<TemplateFieldRequest> fields,
      @Size(max = 200) String name,
      @Size(max = 2000) String description,
      @Size(max = 100) String serviceId,
      @Size(max = 200) String serviceName,
      @Size(max = 100) List<@NotBlank @Size(max = 100) String> tags,
      @Size(max = 500) String changeReason,
      Instant effectiveFrom,
      Long expectedRevision) {}

  public record RestoreVersionRequest(
      @NotBlank @Size(max = 500) String changeReason, Long expectedRevision) {}

  public record TemplatePreviewResponse(String id, String name, String html) {}

  public record TemplateDryRunResponse(
      String templateId,
      String templateVersionId,
      int templateVersion,
      boolean valid,
      long outputSize,
      String outputSha256) {}

  public record LegalContextRequest(
      @Size(max = 100) String crmCaseId,
      @Size(max = 100) String customerId,
      @Size(max = 100) String serviceId,
      @Size(max = 200) String serviceName,
      @Size(max = 100) String dossierId,
      @Size(max = 100) String matterReference,
      @Size(max = 50) Map<@Size(max = 100) String, @Size(max = 500) String> sourceReferences) {}

  public record GenerateDocumentRequest(
      @NotNull @Size(max = 500) Map<@NotBlank String, @Size(max = 100_000) String> values,
      @Valid LegalContextRequest context) {}

  public record TemplateFieldResponse(
      String fieldKey,
      String label,
      String helpText,
      DocumentFieldInputType inputType,
      boolean required,
      int sortOrder,
      String defaultValue,
      Integer maxLength,
      String validationPattern,
      BigDecimal minimum,
      BigDecimal maximum,
      List<String> options,
      DataClassification dataClassification) {}

  public record DocumentTemplateResponse(
      String id,
      String name,
      String description,
      DocumentTemplateStatus status,
      int version,
      String latestVersionId,
      String activeVersionId,
      boolean hasUnpublishedChanges,
      String originalFileName,
      long fileSize,
      String contentSha256,
      List<TemplateFieldResponse> fields,
      String serviceId,
      String serviceName,
      List<String> tags,
      String createdByUserId,
      String updatedByUserId,
      String publishedByUserId,
      Instant effectiveFrom,
      Instant publishedAt,
      Instant createdAt,
      Instant updatedAt,
      Long revision) {}

  public record LegalContextResponse(
      String crmCaseId,
      String customerId,
      String serviceId,
      String serviceName,
      String dossierId,
      String matterReference,
      Map<String, String> sourceReferences) {}

  public record GeneratedDocumentResponse(
      String id,
      String templateId,
      String templateVersionId,
      String templateName,
      int templateVersion,
      String templateContentSha256,
      String generatedContentSha256,
      String fileName,
      String downloadUrl,
      LegalContextResponse context,
      DocumentWorkflowStatus status,
      String reviewerUserId,
      String approvedByUserId,
      String finalizedByUserId,
      String rejectionReason,
      String createdByUserId,
      Instant submittedAt,
      Instant approvedAt,
      Instant finalizedAt,
      Instant createdAt,
      Instant updatedAt,
      Long revision) {}

  public record WorkflowTransitionRequest(
      @NotNull DocumentWorkflowStatus targetStatus,
      @Size(max = 100) String reviewerUserId,
      @Size(max = 2000) String reason,
      Long expectedRevision) {}

  public record TemplateVersionResponse(
      String id,
      String templateId,
      int versionNumber,
      String previousVersionId,
      String name,
      String description,
      String originalFileName,
      long fileSize,
      String contentSha256,
      List<TemplateFieldResponse> fields,
      String changeReason,
      Instant effectiveFrom,
      String createdByUserId,
      Instant createdAt,
      boolean active,
      boolean latest) {}

  public record AuditEventResponse(
      String id,
      String entityType,
      String entityId,
      String action,
      String actorUserId,
      String fromStatus,
      String toStatus,
      Map<String, String> metadata,
      Instant createdAt) {}

  public record PageResponse<T>(
      List<T> content,
      int page,
      int size,
      long totalElements,
      int totalPages,
      boolean first,
      boolean last) {}
}

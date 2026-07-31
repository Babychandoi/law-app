package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.ApplyMappingsRequest;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.PublishTemplateRequest;
import org.law_app.document.web.Dtos.RestoreVersionRequest;
import org.law_app.document.web.Dtos.TemplateDryRunResponse;
import org.law_app.document.web.Dtos.TemplatePreviewResponse;
import org.law_app.document.web.Dtos.TemplateVersionResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentTemplateService {
  DocumentTemplateResponse uploadTemplate(MultipartFile file, String name, String description);

  /** Upload a raw .docx (no placeholders yet) and return its HTML preview for key mapping. */
  TemplatePreviewResponse uploadRaw(MultipartFile file, String name, String description);

  /** HTML preview of a stored template's current .docx. */
  TemplatePreviewResponse preview(String id);

  TemplateDryRunResponse dryRun(String id, GenerateDocumentRequest request);

  /** Apply sample-text → key mappings: insert ${key} into the .docx and create the fields. */
  DocumentTemplateResponse applyMappings(String id, ApplyMappingsRequest request);

  List<DocumentTemplateResponse> listTemplates(String status);

  PageResponse<DocumentTemplateResponse> pageTemplates(
      String query,
      String status,
      String serviceId,
      String folderId,
      String createdBy,
      int page,
      int size,
      String sort,
      String direction);

  DocumentTemplateResponse getTemplate(String id);

  DocumentTemplateResponse duplicate(String id);

  org.law_app.document.web.Dtos.TemplatePreviewResponse previewFilled(
      String id, org.law_app.document.web.Dtos.GenerateDocumentRequest request);

  DocumentTemplateResponse setFolder(String id, String folderId);

  DocumentTemplateResponse updateFields(String id, UpdateFieldsRequest request);

  DocumentTemplateResponse publish(String id, PublishTemplateRequest request);

  DocumentTemplateResponse archive(String id);

  DocumentTemplateResponse restore(String id);

  PageResponse<TemplateVersionResponse> listVersions(String id, int page, int size);

  TemplateVersionResponse getVersion(String id, String versionId);

  TemplatePreviewResponse previewVersion(String id, String versionId);

  DocumentTemplateResponse restoreVersion(
      String id, String versionId, RestoreVersionRequest request);
}

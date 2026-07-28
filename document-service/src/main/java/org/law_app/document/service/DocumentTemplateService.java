package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.ApplyMappingsRequest;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.TemplatePreviewResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentTemplateService {
  DocumentTemplateResponse uploadTemplate(MultipartFile file, String name, String description);

  /** Upload a raw .docx (no placeholders yet) and return its HTML preview for key mapping. */
  TemplatePreviewResponse uploadRaw(MultipartFile file, String name, String description);

  /** HTML preview of a stored template's current .docx. */
  TemplatePreviewResponse preview(String id);

  /** Apply sample-text → key mappings: insert ${key} into the .docx and create the fields. */
  DocumentTemplateResponse applyMappings(String id, ApplyMappingsRequest request);

  List<DocumentTemplateResponse> listTemplates(String status);

  DocumentTemplateResponse getTemplate(String id);

  DocumentTemplateResponse updateFields(String id, UpdateFieldsRequest request);

  DocumentTemplateResponse publish(String id);

  DocumentTemplateResponse archive(String id);
}

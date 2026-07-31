package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.WorkflowTransitionRequest;

public interface GeneratedDocumentService {
  default GeneratedDocumentResponse generate(String templateId, GenerateDocumentRequest request) {
    return generate(templateId, request, null);
  }

  GeneratedDocumentResponse generate(
      String templateId, GenerateDocumentRequest request, String idempotencyKey);

  List<GeneratedDocumentResponse> listGenerated();

  PageResponse<GeneratedDocumentResponse> pageGenerated(
      String query,
      String status,
      String crmCaseId,
      String customerId,
      String serviceId,
      String templateId,
      boolean includeExpired,
      int page,
      int size,
      String sort,
      String direction);

  GeneratedDocumentResponse get(String id);

  GeneratedDocumentResponse transition(String id, WorkflowTransitionRequest request);

  /** Bỏ ẩn tài liệu bị ẩn do quá hạn lưu trữ (admin). */
  GeneratedDocumentResponse restoreFromRetention(String id);

  DownloadFile download(String id);

  record DownloadFile(String fileName, String contentType, java.io.InputStream stream) {}
}

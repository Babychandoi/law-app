package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;

public interface GeneratedDocumentService {
  GeneratedDocumentResponse generate(String templateId, GenerateDocumentRequest request);

  List<GeneratedDocumentResponse> listGenerated();

  DownloadFile download(String id);

  record DownloadFile(String fileName, String contentType, java.io.InputStream stream) {}
}

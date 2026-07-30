package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.DocumentBundleRequest;
import org.law_app.document.web.Dtos.DocumentBundleResponse;
import org.law_app.document.web.Dtos.GenerateBundleRequest;
import org.law_app.document.web.Dtos.GenerateBundleResponse;

public interface DocumentBundleService {
  DocumentBundleResponse create(DocumentBundleRequest request);

  DocumentBundleResponse update(String id, DocumentBundleRequest request);

  List<DocumentBundleResponse> list();

  DocumentBundleResponse get(String id);

  DocumentBundleResponse archive(String id);

  GenerateBundleResponse generate(String id, GenerateBundleRequest request, String idempotencyKey);
}

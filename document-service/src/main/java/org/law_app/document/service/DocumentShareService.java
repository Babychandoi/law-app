package org.law_app.document.service;

import java.io.InputStream;
import java.util.List;
import org.law_app.document.web.Dtos.CreateShareRequest;
import org.law_app.document.web.Dtos.ShareLinkResponse;

public interface DocumentShareService {
  ShareLinkResponse create(String generatedDocumentId, CreateShareRequest request);

  List<ShareLinkResponse> list(String generatedDocumentId);

  ShareLinkResponse revoke(String shareId);

  /** Phân giải token công khai, kiểm tra hạn/lượt và trả về file để stream. */
  SharedFile resolve(String token);

  record SharedFile(String fileName, String contentType, InputStream stream) {}
}

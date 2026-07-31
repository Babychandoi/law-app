package org.law_app.document.web;

import jakarta.validation.Valid;
import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentEmailService;
import org.law_app.document.service.DocumentShareService;
import org.law_app.document.web.Dtos.CreateShareRequest;
import org.law_app.document.web.Dtos.SendDocumentEmailRequest;
import org.law_app.document.web.Dtos.ShareLinkResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentShareController {

  private final DocumentShareService service;
  private final DocumentEmailService emailService;

  @PostMapping("/generated/{id}/email")
  public ApiResponse<Void> email(
      @PathVariable String id, @Valid @RequestBody SendDocumentEmailRequest request) {
    emailService.sendShareLink(
        id, request.to(), request.message(), request.expiresInHours(), request.maxDownloads());
    return ApiResponse.ok(null, "Đã gửi email");
  }

  @PostMapping("/generated/{id}/share")
  public ApiResponse<ShareLinkResponse> create(
      @PathVariable String id, @Valid @RequestBody(required = false) CreateShareRequest request) {
    return ApiResponse.ok(service.create(id, request), "Đã tạo link chia sẻ");
  }

  @GetMapping("/generated/{id}/shares")
  public ApiResponse<List<ShareLinkResponse>> list(@PathVariable String id) {
    return ApiResponse.ok(service.list(id));
  }

  @DeleteMapping("/shares/{shareId}")
  public ApiResponse<ShareLinkResponse> revoke(@PathVariable String shareId) {
    return ApiResponse.ok(service.revoke(shareId), "Đã thu hồi link");
  }

  /** Tải công khai bằng token (không cần đăng nhập). */
  @GetMapping("/shared/{token}")
  public ResponseEntity<InputStreamResource> shared(@PathVariable String token) {
    DocumentShareService.SharedFile file = service.resolve(token);
    InputStream stream = file.stream();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(file.contentType()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(file.fileName(), java.nio.charset.StandardCharsets.UTF_8)
                .build()
                .toString())
        .header("X-Content-Type-Options", "nosniff")
        .header("Cache-Control", "no-store")
        .body(new InputStreamResource(stream));
  }
}

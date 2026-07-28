package org.law_app.document.web;

import jakarta.validation.Valid;
import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.GeneratedDocumentService;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class GeneratedDocumentController {

  private final GeneratedDocumentService service;

  @PostMapping("/templates/{templateId}/generate")
  public ApiResponse<GeneratedDocumentResponse> generate(
      @PathVariable String templateId, @Valid @RequestBody GenerateDocumentRequest request) {
    return ApiResponse.ok(service.generate(templateId, request), "Đã tạo tài liệu");
  }

  @GetMapping("/generated")
  public ApiResponse<List<GeneratedDocumentResponse>> listGenerated() {
    return ApiResponse.ok(service.listGenerated());
  }

  @GetMapping("/generated/{id}/download")
  public ResponseEntity<InputStreamResource> download(@PathVariable String id) {
    GeneratedDocumentService.DownloadFile file = service.download(id);
    InputStream stream = file.stream();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(file.contentType()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(file.fileName(), java.nio.charset.StandardCharsets.UTF_8)
                .build()
                .toString())
        .body(new InputStreamResource(stream));
  }
}

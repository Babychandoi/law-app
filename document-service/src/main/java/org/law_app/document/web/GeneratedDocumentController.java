package org.law_app.document.web;

import jakarta.validation.Valid;
import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentAuditService;
import org.law_app.document.service.GeneratedDocumentService;
import org.law_app.document.web.Dtos.AuditEventResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.WorkflowTransitionRequest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class GeneratedDocumentController {

  private final GeneratedDocumentService service;
  private final DocumentAuditService auditService;
  private final org.law_app.document.service.PdfConversionService pdfConversionService;

  @PostMapping("/templates/{templateId}/generate")
  public ApiResponse<GeneratedDocumentResponse> generate(
      @PathVariable String templateId,
      @Valid @RequestBody GenerateDocumentRequest request,
      @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
    return ApiResponse.ok(service.generate(templateId, request, idempotencyKey), "Đã tạo tài liệu");
  }

  /** Legacy unpaged list retained for the current UI; capped server-side at 200 rows. */
  @GetMapping("/generated")
  public ApiResponse<List<GeneratedDocumentResponse>> listGenerated() {
    return ApiResponse.ok(service.listGenerated());
  }

  @GetMapping("/generated/page")
  public ApiResponse<PageResponse<GeneratedDocumentResponse>> pageGenerated(
      @RequestParam(value = "q", required = false) String query,
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "crmCaseId", required = false) String crmCaseId,
      @RequestParam(value = "customerId", required = false) String customerId,
      @RequestParam(value = "serviceId", required = false) String serviceId,
      @RequestParam(value = "templateId", required = false) String templateId,
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size,
      @RequestParam(value = "sort", defaultValue = "createdAt") String sort,
      @RequestParam(value = "direction", defaultValue = "desc") String direction) {
    return ApiResponse.ok(
        service.pageGenerated(
            query,
            status,
            crmCaseId,
            customerId,
            serviceId,
            templateId,
            page,
            size,
            sort,
            direction));
  }

  @GetMapping("/generated/{id}")
  public ApiResponse<GeneratedDocumentResponse> detail(@PathVariable String id) {
    return ApiResponse.ok(service.get(id));
  }

  @PutMapping("/generated/{id}/workflow")
  public ApiResponse<GeneratedDocumentResponse> transition(
      @PathVariable String id, @Valid @RequestBody WorkflowTransitionRequest request) {
    return ApiResponse.ok(service.transition(id, request), "Đã cập nhật trạng thái tài liệu");
  }

  @GetMapping("/generated/{id}/audit")
  public ApiResponse<PageResponse<AuditEventResponse>> audit(
      @PathVariable String id,
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size) {
    service.get(id);
    return ApiResponse.ok(
        auditService.list(DocumentAuditService.GENERATED_DOCUMENT, id, page, size));
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
        .header("X-Content-Type-Options", "nosniff")
        .body(new InputStreamResource(stream));
  }

  @GetMapping("/generated/{id}/pdf")
  public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) throws java.io.IOException {
    GeneratedDocumentService.DownloadFile file = service.download(id);
    byte[] docx;
    try (InputStream stream = file.stream()) {
      docx = stream.readAllBytes();
    }
    byte[] pdf = pdfConversionService.toPdf(docx, file.fileName());
    String pdfName = org.law_app.document.service.PdfConversionService.pdfFileName(file.fileName());
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(pdfName, java.nio.charset.StandardCharsets.UTF_8)
                .build()
                .toString())
        .header("X-Content-Type-Options", "nosniff")
        .body(pdf);
  }
}

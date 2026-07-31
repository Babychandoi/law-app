package org.law_app.document.web;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentAuditService;
import org.law_app.document.service.DocumentTemplateService;
import org.law_app.document.web.Dtos.ApplyMappingsRequest;
import org.law_app.document.web.Dtos.AuditEventResponse;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.PublishTemplateRequest;
import org.law_app.document.web.Dtos.RestoreVersionRequest;
import org.law_app.document.web.Dtos.TemplateDryRunResponse;
import org.law_app.document.web.Dtos.TemplatePreviewResponse;
import org.law_app.document.web.Dtos.TemplateVersionResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents/templates")
@RequiredArgsConstructor
public class DocumentTemplateController {

  private final DocumentTemplateService service;
  private final DocumentAuditService auditService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<DocumentTemplateResponse> upload(
      @RequestPart("file") MultipartFile file,
      @RequestParam("name") String name,
      @RequestParam(value = "description", required = false) String description) {
    return ApiResponse.ok(service.uploadTemplate(file, name, description), "Đã tải mẫu tài liệu");
  }

  @PostMapping(value = "/upload-raw", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<TemplatePreviewResponse> uploadRaw(
      @RequestPart("file") MultipartFile file,
      @RequestParam("name") String name,
      @RequestParam(value = "description", required = false) String description) {
    return ApiResponse.ok(service.uploadRaw(file, name, description), "Đã tải file, hãy gán key");
  }

  @GetMapping("/{id}/preview")
  public ApiResponse<TemplatePreviewResponse> preview(@PathVariable String id) {
    return ApiResponse.ok(service.preview(id));
  }

  @PostMapping("/{id}/dry-run")
  public ApiResponse<TemplateDryRunResponse> dryRun(
      @PathVariable String id, @Valid @RequestBody GenerateDocumentRequest request) {
    return ApiResponse.ok(service.dryRun(id, request), "Đã kiểm thử mẫu thành công");
  }

  @PutMapping("/{id}/mappings")
  public ApiResponse<DocumentTemplateResponse> applyMappings(
      @PathVariable String id, @Valid @RequestBody ApplyMappingsRequest request) {
    return ApiResponse.ok(service.applyMappings(id, request), "Đã gán key vào file mẫu");
  }

  /** Legacy unpaged list retained for the current UI; capped server-side at 200 rows. */
  @GetMapping
  public ApiResponse<List<DocumentTemplateResponse>> list(
      @RequestParam(value = "status", required = false) String status) {
    return ApiResponse.ok(service.listTemplates(status));
  }

  @GetMapping("/page")
  public ApiResponse<PageResponse<DocumentTemplateResponse>> page(
      @RequestParam(value = "q", required = false) String query,
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "serviceId", required = false) String serviceId,
      @RequestParam(value = "folderId", required = false) String folderId,
      @RequestParam(value = "createdBy", required = false) String createdBy,
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size,
      @RequestParam(value = "sort", defaultValue = "updatedAt") String sort,
      @RequestParam(value = "direction", defaultValue = "desc") String direction) {
    return ApiResponse.ok(
        service.pageTemplates(
            query, status, serviceId, folderId, createdBy, page, size, sort, direction));
  }

  @PostMapping("/{id}/duplicate")
  public ApiResponse<DocumentTemplateResponse> duplicate(@PathVariable String id) {
    return ApiResponse.ok(service.duplicate(id), "Đã nhân bản mẫu");
  }

  @GetMapping("/{id}")
  public ApiResponse<DocumentTemplateResponse> detail(@PathVariable String id) {
    return ApiResponse.ok(service.getTemplate(id));
  }

  @PutMapping("/{id}/folder")
  public ApiResponse<DocumentTemplateResponse> setFolder(
      @PathVariable String id,
      @Valid @RequestBody org.law_app.document.web.Dtos.SetFolderRequest request) {
    return ApiResponse.ok(service.setFolder(id, request.folderId()), "Đã cập nhật thư mục");
  }

  @PutMapping("/{id}/fields")
  public ApiResponse<DocumentTemplateResponse> updateFields(
      @PathVariable String id, @Valid @RequestBody UpdateFieldsRequest request) {
    return ApiResponse.ok(service.updateFields(id, request), "Đã lưu cấu hình key");
  }

  @PutMapping("/{id}/publish")
  public ApiResponse<DocumentTemplateResponse> publish(
      @PathVariable String id,
      @Valid @RequestBody(required = false) PublishTemplateRequest request) {
    return ApiResponse.ok(service.publish(id, request), "Đã lưu và publish mẫu tài liệu");
  }

  @PutMapping("/{id}/archive")
  public ApiResponse<DocumentTemplateResponse> archive(@PathVariable String id) {
    return ApiResponse.ok(service.archive(id), "Đã lưu trữ mẫu tài liệu");
  }

  @PutMapping("/{id}/restore")
  public ApiResponse<DocumentTemplateResponse> restore(@PathVariable String id) {
    return ApiResponse.ok(service.restore(id), "Đã khôi phục mẫu tài liệu");
  }

  @GetMapping("/{id}/versions")
  public ApiResponse<PageResponse<TemplateVersionResponse>> versions(
      @PathVariable String id,
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size) {
    return ApiResponse.ok(service.listVersions(id, page, size));
  }

  @GetMapping("/{id}/versions/{versionId}")
  public ApiResponse<TemplateVersionResponse> version(
      @PathVariable String id, @PathVariable String versionId) {
    return ApiResponse.ok(service.getVersion(id, versionId));
  }

  @GetMapping("/{id}/versions/{versionId}/preview")
  public ApiResponse<TemplatePreviewResponse> previewVersion(
      @PathVariable String id, @PathVariable String versionId) {
    return ApiResponse.ok(service.previewVersion(id, versionId));
  }

  @PostMapping("/{id}/versions/{versionId}/restore")
  public ApiResponse<DocumentTemplateResponse> restoreVersion(
      @PathVariable String id,
      @PathVariable String versionId,
      @Valid @RequestBody RestoreVersionRequest request) {
    return ApiResponse.ok(
        service.restoreVersion(id, versionId, request), "Đã tạo bản nháp từ phiên bản cũ");
  }

  @GetMapping("/{id}/audit")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<PageResponse<AuditEventResponse>> audit(
      @PathVariable String id,
      @RequestParam(value = "page", defaultValue = "0") int page,
      @RequestParam(value = "size", defaultValue = "20") int size) {
    service.getTemplate(id);
    return ApiResponse.ok(auditService.list(DocumentAuditService.TEMPLATE, id, page, size));
  }
}

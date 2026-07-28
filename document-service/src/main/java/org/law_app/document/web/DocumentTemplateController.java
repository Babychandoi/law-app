package org.law_app.document.web;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentTemplateService;
import org.law_app.document.web.Dtos.ApplyMappingsRequest;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.TemplatePreviewResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.http.MediaType;
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

  @PutMapping("/{id}/mappings")
  public ApiResponse<DocumentTemplateResponse> applyMappings(
      @PathVariable String id, @Valid @RequestBody ApplyMappingsRequest request) {
    return ApiResponse.ok(service.applyMappings(id, request), "Đã gán key vào file mẫu");
  }

  @GetMapping
  public ApiResponse<List<DocumentTemplateResponse>> list(
      @RequestParam(value = "status", required = false) String status) {
    return ApiResponse.ok(service.listTemplates(status));
  }

  @GetMapping("/{id}")
  public ApiResponse<DocumentTemplateResponse> detail(@PathVariable String id) {
    return ApiResponse.ok(service.getTemplate(id));
  }

  @PutMapping("/{id}/fields")
  public ApiResponse<DocumentTemplateResponse> updateFields(
      @PathVariable String id, @Valid @RequestBody UpdateFieldsRequest request) {
    return ApiResponse.ok(service.updateFields(id, request), "Đã lưu cấu hình key");
  }

  @PutMapping("/{id}/publish")
  public ApiResponse<DocumentTemplateResponse> publish(@PathVariable String id) {
    return ApiResponse.ok(service.publish(id), "Đã publish mẫu tài liệu");
  }

  @PutMapping("/{id}/archive")
  public ApiResponse<DocumentTemplateResponse> archive(@PathVariable String id) {
    return ApiResponse.ok(service.archive(id), "Đã lưu trữ mẫu tài liệu");
  }
}

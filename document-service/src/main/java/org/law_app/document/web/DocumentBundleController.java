package org.law_app.document.web;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentBundleService;
import org.law_app.document.web.Dtos.DocumentBundleRequest;
import org.law_app.document.web.Dtos.DocumentBundleResponse;
import org.law_app.document.web.Dtos.GenerateBundleRequest;
import org.law_app.document.web.Dtos.GenerateBundleResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents/bundles")
@RequiredArgsConstructor
public class DocumentBundleController {

  private final DocumentBundleService service;

  @GetMapping
  public ApiResponse<List<DocumentBundleResponse>> list() {
    return ApiResponse.ok(service.list());
  }

  @GetMapping("/{id}")
  public ApiResponse<DocumentBundleResponse> get(@PathVariable String id) {
    return ApiResponse.ok(service.get(id));
  }

  @PostMapping
  public ApiResponse<DocumentBundleResponse> create(
      @Valid @RequestBody DocumentBundleRequest request) {
    return ApiResponse.ok(service.create(request), "Đã tạo bộ mẫu");
  }

  @PutMapping("/{id}")
  public ApiResponse<DocumentBundleResponse> update(
      @PathVariable String id, @Valid @RequestBody DocumentBundleRequest request) {
    return ApiResponse.ok(service.update(id, request), "Đã cập nhật bộ mẫu");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<DocumentBundleResponse> archive(@PathVariable String id) {
    return ApiResponse.ok(service.archive(id), "Đã lưu trữ bộ mẫu");
  }

  @PostMapping("/{id}/generate")
  public ApiResponse<GenerateBundleResponse> generate(
      @PathVariable String id,
      @Valid @RequestBody GenerateBundleRequest request,
      @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
    return ApiResponse.ok(service.generate(id, request, idempotencyKey), "Đã tạo bộ tài liệu");
  }
}

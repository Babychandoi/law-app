package org.law_app.document.web;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentFolderService;
import org.law_app.document.web.Dtos.FolderRequest;
import org.law_app.document.web.Dtos.FolderResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents/folders")
@RequiredArgsConstructor
public class DocumentFolderController {

  private final DocumentFolderService service;

  @GetMapping
  public ApiResponse<List<FolderResponse>> list() {
    return ApiResponse.ok(service.list());
  }

  @PostMapping
  public ApiResponse<FolderResponse> create(@Valid @RequestBody FolderRequest request) {
    return ApiResponse.ok(service.create(request), "Đã tạo thư mục");
  }

  @PutMapping("/{id}")
  public ApiResponse<FolderResponse> rename(
      @PathVariable String id, @Valid @RequestBody FolderRequest request) {
    return ApiResponse.ok(service.rename(id, request), "Đã đổi tên thư mục");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    service.delete(id);
    return ApiResponse.ok(null, "Đã xóa thư mục");
  }
}

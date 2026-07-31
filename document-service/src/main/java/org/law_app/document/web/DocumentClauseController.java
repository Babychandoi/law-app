package org.law_app.document.web;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentClauseService;
import org.law_app.document.web.Dtos.ClauseRequest;
import org.law_app.document.web.Dtos.ClauseResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents/clauses")
@RequiredArgsConstructor
public class DocumentClauseController {

  private final DocumentClauseService service;

  @GetMapping
  public ApiResponse<List<ClauseResponse>> list(
      @RequestParam(value = "q", required = false) String query,
      @RequestParam(value = "tag", required = false) String tag) {
    return ApiResponse.ok(service.list(query, tag));
  }

  @GetMapping("/{id}")
  public ApiResponse<ClauseResponse> get(@PathVariable String id) {
    return ApiResponse.ok(service.get(id));
  }

  @PostMapping
  public ApiResponse<ClauseResponse> create(@Valid @RequestBody ClauseRequest request) {
    return ApiResponse.ok(service.create(request), "Đã tạo điều khoản");
  }

  @PutMapping("/{id}")
  public ApiResponse<ClauseResponse> update(
      @PathVariable String id, @Valid @RequestBody ClauseRequest request) {
    return ApiResponse.ok(service.update(id, request), "Đã cập nhật điều khoản");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<ClauseResponse> archive(@PathVariable String id) {
    return ApiResponse.ok(service.archive(id), "Đã lưu trữ điều khoản");
  }
}

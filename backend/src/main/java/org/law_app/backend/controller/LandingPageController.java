package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.LandingPageRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.LandingPageResponse;
import org.law_app.backend.dto.response.LandingPageViewResponse;
import org.law_app.backend.service.LandingPageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/landing")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class LandingPageController {
  LandingPageService landingPageService;

  /**
   * Public — chỉ trả landing đã xuất bản. Bản nháp coi như không tồn tại.
   *
   * <p>Trả 404 chứ không để lọt vào handler catch-all (thành 500): slug sai hoặc landing còn nháp
   * là chuyện thường ngày, báo 500 sẽ làm nhiễu giám sát lỗi và trông như sự cố hệ thống.
   */
  @GetMapping("/page")
  ResponseEntity<ApiResponse<LandingPageViewResponse>> getLandingPage(
      @RequestParam("slug") String slug) {
    return landingPageService
        .getPublishedBySlug(slug)
        .map(
            view ->
                ResponseEntity.ok(
                    ApiResponse.<LandingPageViewResponse>builder()
                        .message("Landing page retrieved successfully")
                        .data(view)
                        .build()))
        .orElseGet(
            () ->
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                        ApiResponse.<LandingPageViewResponse>builder()
                            .code(HttpStatus.NOT_FOUND.value())
                            .message("Không tìm thấy landing page")
                            .build()));
  }

  @GetMapping
  ApiResponse<List<LandingPageResponse>> getAll() {
    return ApiResponse.<List<LandingPageResponse>>builder()
        .message("Landing pages retrieved successfully")
        .data(landingPageService.getAll())
        .build();
  }

  @PostMapping
  ApiResponse<LandingPageResponse> create(@RequestBody LandingPageRequest request) {
    return ApiResponse.<LandingPageResponse>builder()
        .message("Landing page created successfully")
        .data(landingPageService.create(request))
        .build();
  }

  @PutMapping("/{id}")
  ApiResponse<LandingPageResponse> update(
      @PathVariable String id, @RequestBody LandingPageRequest request) {
    return ApiResponse.<LandingPageResponse>builder()
        .message("Landing page updated successfully")
        .data(landingPageService.update(id, request))
        .build();
  }

  @DeleteMapping("/{id}")
  ApiResponse<Boolean> delete(@PathVariable String id) {
    return ApiResponse.<Boolean>builder()
        .message("Landing page deleted successfully")
        .data(landingPageService.delete(id))
        .build();
  }
}

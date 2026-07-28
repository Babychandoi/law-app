package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.ApiMeta;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.dto.response.SubscriberResponse;
import org.law_app.backend.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class NewsController {
  NewsService newsService;

  @PostMapping
  public ApiResponse<NewsResponse> createNews(@RequestBody NewsRequest newsRequest) {
    return ApiResponse.<NewsResponse>builder()
        .message("News created successfully")
        .data(newsService.createNews(newsRequest))
        .build();
  }

  @PostMapping("/subscribe")
  public ApiResponse<String> subscribe(@RequestParam String email) {
    return ApiResponse.<String>builder()
        .message("Subscription successful")
        .data(newsService.subscribe(email))
        .build();
  }

  @GetMapping
  public ApiResponse<List<NewsResponse>> getAllNews(
      @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<NewsResponse> news = newsService.getAllNews(pageable);
    return ApiResponse.<List<NewsResponse>>builder()
        .message("All news retrieved successfully")
        .data(news.getContent())
        .meta(ApiMeta.from(news))
        .build();
  }

  @GetMapping("/{id}")
  public ApiResponse<NewsResponse> getNewsById(@PathVariable String id) {
    return ApiResponse.<NewsResponse>builder()
        .message("News retrieved successfully")
        .data(newsService.getNewsById(id))
        .build();
  }

  @PutMapping("/{id}")
  public ApiResponse<NewsResponse> updateNews(
      @PathVariable String id, @RequestBody NewsRequest newsRequest) {
    return ApiResponse.<NewsResponse>builder()
        .message("News updated successfully")
        .data(newsService.updateNews(id, newsRequest))
        .build();
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> deleteNews(@PathVariable String id) {
    return ApiResponse.<Boolean>builder()
        .message("News deleted successfully")
        .data(newsService.deleteNews(id))
        .build();
  }

  /** Lịch sử phiên bản của bài viết (Admin). GET /news/{id}/versions */
  @GetMapping("/{id}/versions")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<List<org.law_app.backend.entity.NewsVersion>> getVersions(
      @PathVariable String id) {
    return ApiResponse.<List<org.law_app.backend.entity.NewsVersion>>builder()
        .message("News versions retrieved successfully")
        .data(newsService.getNewsVersions(id))
        .build();
  }

  /** Nội dung đầy đủ của một phiên bản (Admin). GET /news/{id}/versions/{versionId} */
  @GetMapping("/{id}/versions/{versionId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<org.law_app.backend.entity.NewsVersion> getVersion(
      @PathVariable String id, @PathVariable String versionId) {
    return ApiResponse.<org.law_app.backend.entity.NewsVersion>builder()
        .message("News version retrieved successfully")
        .data(newsService.getNewsVersion(versionId))
        .build();
  }

  /** Khôi phục bài viết về một phiên bản (Admin). POST /news/{id}/versions/{versionId}/restore */
  @PostMapping("/{id}/versions/{versionId}/restore")
  public ApiResponse<NewsResponse> restoreVersion(
      @PathVariable String id, @PathVariable String versionId) {
    return ApiResponse.<NewsResponse>builder()
        .message("News restored successfully")
        .data(newsService.restoreNewsVersion(id, versionId))
        .build();
  }

  /** Get subscribers (Admin only) — phân trang + tìm kiếm server-side. GET /news/subscribers */
  @GetMapping("/subscribers")
  public ApiResponse<List<SubscriberResponse>> getAllSubscribers(
      @RequestParam(required = false) String q,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<SubscriberResponse> subscribers = newsService.getSubscribers(q, pageable);
    return ApiResponse.<List<SubscriberResponse>>builder()
        .message("Subscribers retrieved successfully")
        .data(subscribers.getContent())
        .meta(ApiMeta.from(subscribers))
        .build();
  }

  /** Delete subscriber (Admin only) DELETE /news/subscribers/{id} */
  @DeleteMapping("/subscribers/{id}")
  public ApiResponse<Boolean> deleteSubscriber(@PathVariable String id) {
    return ApiResponse.<Boolean>builder()
        .message("Subscriber deleted successfully")
        .data(newsService.deleteSubscriber(id))
        .build();
  }
}

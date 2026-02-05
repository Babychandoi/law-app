package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.service.NewsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
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
    public ApiResponse<List<NewsResponse>> getAllNews() {
        return ApiResponse.<List<NewsResponse>>builder()
                .message("All news retrieved successfully")
                .data(newsService.getAllNews())
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
    public ApiResponse<NewsResponse> updateNews(@PathVariable String id, @RequestBody NewsRequest newsRequest) {
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
}

package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.dto.response.SubscriberResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NewsService {
  NewsResponse createNews(NewsRequest newsRequest);

  String subscribe(String email);

  List<NewsResponse> getAllNews();

  Page<NewsResponse> getAllNews(Pageable pageable);

  NewsResponse getNewsById(String id);

  NewsResponse updateNews(String id, NewsRequest newsRequest);

  Boolean deleteNews(String id);

  List<SubscriberResponse> getAllSubscribers();

  /** Danh sách người đăng ký có phân trang + tìm kiếm theo email (server-side). */
  Page<SubscriberResponse> getSubscribers(String q, Pageable pageable);

  Boolean deleteSubscriber(String id);
}

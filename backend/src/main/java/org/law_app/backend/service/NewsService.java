package org.law_app.backend.service;

import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.dto.response.SubscriberResponse;

import java.util.List;

public interface NewsService {
    NewsResponse createNews(NewsRequest newsRequest);
    String subscribe(String email);
    List<NewsResponse> getAllNews();
    NewsResponse getNewsById(String id);
    NewsResponse updateNews(String id, NewsRequest newsRequest);
    Boolean deleteNews(String id);
    List<SubscriberResponse> getAllSubscribers();
    Boolean deleteSubscriber(String id);
}

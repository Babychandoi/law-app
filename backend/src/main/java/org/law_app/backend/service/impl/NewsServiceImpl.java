package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.entity.News;
import org.law_app.backend.entity.SectionNews;
import org.law_app.backend.mapper.NewsMapper;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.repository.SectionNewsRepository;
import org.law_app.backend.service.NewsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class NewsServiceImpl implements NewsService {
    NewsRepository newsRepository;
    SectionNewsRepository sectionNewsRepository;
    NewsMapper newsMapper;
    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest newsRequest) {
        try{
            News news = newsRepository.save(newsMapper.toNews(newsRequest));
            return newsMapper.toNewsResponse(news);
        } catch (Exception e) {
            log.error("Error creating news: {}", e.getMessage());
            throw new RuntimeException("Failed to create news", e);
        }
    }

    @Override
    public List<NewsResponse> getAllNews() {
        try {
            List<News> news = newsRepository.findAll();
            return news.stream()
                    .map(n -> NewsResponse.builder()
                            .id(n.getId())
                            .title(n.getTitle())
                            .subtitle(n.getSubtitle())
                            .author(n.getAuthor())
                            .image(n.getImage())
                            .createdAt(n.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        }catch (Exception e) {
            log.error("Error fetching all news: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch news", e);
        }
    }

    @Override
    public NewsResponse getNewsById(String id) {
        try {
            News news = newsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
            return newsMapper.toNewsResponse(news);
        } catch (Exception e) {
            log.error("Error fetching news by id: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch news by id", e);
        }
    }
    @Transactional
    @Override
    public NewsResponse updateNews(String id, NewsRequest newsRequest) {
        try {
            News existingNews = newsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("News not found with id: " + id));

            sectionNewsRepository.deleteAll(existingNews.getSections());

            // ✅ Cập nhật trực tiếp
            newsMapper.updateNewsFromRequest(existingNews, newsRequest);

            // ✅ Không còn lỗi detached entity
            return newsMapper.toNewsResponse(existingNews);
        } catch (Exception e) {
            log.error("Error updating news: {}", e.getMessage());
            throw new RuntimeException("Failed to update news", e);
        }
    }

    @Transactional
    @Override
    public Boolean deleteNews(String id) {
        try {
            News news = newsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
            sectionNewsRepository.deleteAll(news.getSections());
            newsRepository.delete(news);
            return true;
        } catch (Exception e) {
            log.error("Error deleting news: {}", e.getMessage());
            throw new RuntimeException("Failed to delete news", e);
        }
    }
}

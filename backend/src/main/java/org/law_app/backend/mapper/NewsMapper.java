package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.entity.News;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NewsMapper {
    default NewsResponse toNewsResponse(News news){
        return NewsResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .subtitle(news.getSubtitle())
                .author(news.getAuthor())
                .image(news.getImage())
                .createdAt(news.getCreatedAt())
                .fullContent(news.getFullContent())
                .build();
    }
    default News toNews(NewsRequest newsRequest ){
        return News.builder()
                .id(newsRequest.getId())
                .title(newsRequest.getTitle())
                .subtitle(newsRequest.getSubtitle())
                .author(newsRequest.getAuthor())
                .image(newsRequest.getImage())
                .fullContent(newsRequest.getFullContent())
                .build();
    }

    default void updateNewsFromRequest(News existingNews, NewsRequest newsRequest) {
        existingNews.setTitle(newsRequest.getTitle());
        existingNews.setSubtitle(newsRequest.getSubtitle());
        existingNews.setAuthor(newsRequest.getAuthor());
        
        // Only update image if a new image is provided
        if (newsRequest.getImage() != null && !newsRequest.getImage().trim().isEmpty()) {
            existingNews.setImage(newsRequest.getImage());
        }
        
        existingNews.setFullContent(newsRequest.getFullContent());
    }

}

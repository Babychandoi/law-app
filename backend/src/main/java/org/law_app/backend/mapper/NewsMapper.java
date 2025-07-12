package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.request.SectionNewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.dto.response.SectionNewsResponse;
import org.law_app.backend.entity.News;
import org.law_app.backend.entity.SectionNews;
import org.mapstruct.Mapper;

import java.util.List;

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
                .sections(news.getSections() != null ?
                          news.getSections().stream()
                              .map(this::toSectionNewsResponse)
                              .toList() : null)
                .build();
    }
    default News toNews(NewsRequest newsRequest ){
        return News.builder()
                .title(newsRequest.getTitle())
                .subtitle(newsRequest.getSubtitle())
                .author(newsRequest.getAuthor())
                .image(newsRequest.getImage())
                .sections(newsRequest.getSections() != null ?
                          newsRequest.getSections().stream()
                              .map(section -> toSectionNews(section, null))
                              .toList() : null)
                .build();
    }
    default SectionNewsResponse toSectionNewsResponse(SectionNews sectionNews) {
        return SectionNewsResponse.builder()
                .id(sectionNews.getId())
                .title(sectionNews.getTitle())
                .content(sectionNews.getContent())
                .icon(sectionNews.getIcon())
                .build();
    }
    default SectionNews toSectionNews(SectionNewsRequest sectionNewsRequest , News news) {
        return SectionNews.builder()
                .title(sectionNewsRequest.getTitle())
                .content(sectionNewsRequest.getContent())
                .icon(sectionNewsRequest.getIcon())
                .news(news)
                .build();
    }
    default void updateNewsFromRequest(News existingNews, NewsRequest newsRequest) {
        existingNews.setTitle(newsRequest.getTitle());
        existingNews.setSubtitle(newsRequest.getSubtitle());
        existingNews.setAuthor(newsRequest.getAuthor());
        existingNews.setImage(newsRequest.getImage());

        if (newsRequest.getSections() != null) {
            List<SectionNews> sections = newsRequest.getSections().stream()
                    .map(section -> toSectionNews(section, existingNews))
                    .toList();
            existingNews.setSections(sections);
        }
    }

}

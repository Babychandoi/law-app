package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NewsRequest {
    String id; // Unique identifier for the news article
    String title; // Title of the news article
    String subtitle; // Subtitle of the news article
    String author; // Author of the news article
    String image; // Image associated with the news article
    String fullContent; // Full HTML content from rich text editor
}

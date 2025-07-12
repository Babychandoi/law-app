package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.law_app.backend.common.IconNews;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SectionNewsRequest {
    String id; // Unique identifier for the section news
    String title; // Title of the section news
    String content; // Content of the section news
    IconNews icon; // Icon associated with the section news
}

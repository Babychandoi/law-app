package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServicesHomeResponse {
    String id; // Unique identifier for the service
    String icon; // Icon associated with the service
    String title; // Title of the service
    String href; // URL or link associated with the service
    String description; // Description of the service
}

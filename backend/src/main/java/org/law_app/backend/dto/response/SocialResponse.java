package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Color;
import org.law_app.backend.common.Icon;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SocialResponse {
    String id; // Unique identifier for the social entity
    Icon icon; // Icon associated with the social entity
    String href; // URL or link associated with the social entity
    String label; // Label for the social entity (e.g., "Facebook", "Twitter")
    String color; // Color associated with the social entity, if applicable
}

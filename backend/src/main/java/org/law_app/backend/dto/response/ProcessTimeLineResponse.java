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
public class ProcessTimeLineResponse {
    String title; // Title of the timeline event
    String description; // Description of the timeline event
    Icon icon; // Icon representing the timeline event
    Color color; // Color associated with the timeline event
    String duration; // Duration of the timeline event
}

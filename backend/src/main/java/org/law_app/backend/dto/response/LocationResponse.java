package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Color;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LocationResponse {
    String id; // Unique identifier for the location
    String type; // Type of the location (e.g., city, state, country)
    String address; // Address of the location
    Color color; // Color associated with the location, if applicable
}

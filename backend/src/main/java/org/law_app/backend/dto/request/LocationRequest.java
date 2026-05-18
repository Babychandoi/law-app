package org.law_app.backend.dto.request;

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
public class LocationRequest {
    String type; // Type of the location (e.g., city, state, country)
    String address; // Address of the location
    Color color; // Color associated with the location, if applicable
}

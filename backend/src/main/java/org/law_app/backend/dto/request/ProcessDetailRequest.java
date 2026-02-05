package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProcessDetailRequest {
    String type; // Type of the detail (e.g., "document", "task")
    String desc; // Description of the detail
    String time; // Estimated time for this detail, if applicable
    String accuracy; // Accuracy of the detail, if applicable
}

package org.law_app.backend.dto.request;

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
public class ImportantRequest {
    String text; // Text content of the important entity
    String href; // URL or link associated with the important entity
    Icon icon; // Icon associated with the important entity, if applicable
    Color color; // Color associated with the important entity, if applicable
}

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
public class PreviousPartnerRequest {
    String title; // Title of the previous partner
    String image; // Image URL or path for the previous partner
    String shortName; // Short name or abbreviation for the previous partner
}

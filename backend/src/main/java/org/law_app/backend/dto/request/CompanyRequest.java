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
public class CompanyRequest {
    String name; // Name of the company
    String representative; // Name of the representative
    String taxCode; // Tax code of the company
    String websiteName; // Website of the company
    String email; // Email of the company
}

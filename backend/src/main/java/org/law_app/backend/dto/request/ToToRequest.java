package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ToToRequest {
    CompanyRequest company; // Company details
    List<PhoneContactRequest> phoneContacts; // List of phone contacts
    List<ImportantRequest> importants; // List of important entities
    List<LocationRequest> locations; // List of locations
    List<SocialRequest> socials; // List of social media accounts
}

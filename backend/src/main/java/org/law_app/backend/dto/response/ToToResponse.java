package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ToToResponse {
  CompanyResponse company; // Company information
  List<LocationResponse> locations; // List of locations associated with the company
  List<ImportantResponse> importants; // List of important entities associated with the company
  List<PhoneContactResponse> phoneContacts; // List of phone contacts associated with the company
  List<SocialResponse> socials; // List of social media accounts associated with the company
}

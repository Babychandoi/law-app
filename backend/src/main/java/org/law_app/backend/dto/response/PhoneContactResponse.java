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
public class PhoneContactResponse {
    String id; // Unique identifier for the phone contact
    String label; // Label for the phone contact (e.g., "Work", "Home")
    String number; // Phone number of the contact
    Color color; // Color associated with the phone contact, if applicable
}

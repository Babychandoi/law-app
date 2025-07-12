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
public class CustomerRequest {
    String name; // Name of the customer
    String email; // Email address of the customer
    String phone; // Phone number of the customer
    String description; // Description of the customer
    String serviceId; // ID of the service associated with the customer
}

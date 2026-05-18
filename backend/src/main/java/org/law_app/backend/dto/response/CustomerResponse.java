package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.law_app.backend.common.Status;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerResponse {
    String id; // Unique identifier for the customer
    String name; // Name of the customer
    String email; // Email address of the customer
    String phone; // Phone number of the customer
    String serviceId; // ID of the service associated with the customer
    String serviceName; // Name of the service associated with the customer
    Status status; // Status of the customer (e.g., ACTIVE, INACTIVE)
    Date createdAt; // Date when the customer was created
}

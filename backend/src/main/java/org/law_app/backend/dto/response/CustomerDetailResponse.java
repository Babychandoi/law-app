package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerDetailResponse  extends CustomerResponse {
    String description; // Description of the customer
    Date  updatedAt; // Date when the customer was last updated
    Date completedAt; // Date when the customer was completed
    Date cancelledAt; // Date when the customer was cancelled

}

package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserRequest {
    String username; // Username of the user
    String password; // Password of the user
    String email; // Email address of the user
    String fullName; // Full name of the user
    String phoneNumber; // Phone number of the user
    Role role; // Role of the user (e.g., admin, user)
    String position; // Position of the user in the organization
}

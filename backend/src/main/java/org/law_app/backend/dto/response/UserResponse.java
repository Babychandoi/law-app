package org.law_app.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;

import java.util.Date;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE )
public class UserResponse {
    String id;
    String username;
    String fullName;
    Active active;
    Role role;
    String email;
    String phoneNumber;
    String position;
    Date createdAt;
}

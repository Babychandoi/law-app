package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the user
    String username; // Username of the user
    String password; // Password of the user
    String email; // Email address of the user
    String phone; // Phone number of the user
    String fullName; // Full name of the user
    Role role; // Role of the user (e.g., ADMIN, USER)
    String position; // Position of the user in the organization
    Active active; // Indicates if the user is active or not
    @CreationTimestamp
    Date createdAt; // Timestamp when the user was created
}

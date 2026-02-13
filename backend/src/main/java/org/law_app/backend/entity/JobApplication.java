package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String jobId;

    @Column(nullable = false)
    String jobTitle;

    @Column(nullable = false)
    String candidateName;

    @Column(nullable = false)
    String candidateEmail;

    @Column
    String candidatePhone;

    @Column(nullable = false)
    String cvFileUrl; // Google Drive link

    @Column
    String cvFileName;

    @Column
    String status; // PENDING, REVIEWING, ACCEPTED, REJECTED

    @Column(nullable = false)
    @CreationTimestamp
    Date appliedDate;

    @Column
    String notes;
}

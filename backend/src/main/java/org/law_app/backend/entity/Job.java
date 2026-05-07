package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(
    indexes = {
      @Index(name = "idx_job_category", columnList = "category"),
      @Index(name = "idx_job_type", columnList = "jobType"),
      @Index(name = "idx_job_location", columnList = "location"),
      @Index(name = "idx_job_posted_date", columnList = "postedDate")
    })
public class Job {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String title;

  @Column private String company;

  @Column(nullable = false)
  private String jobType;

  @Column(nullable = false)
  private String location;

  @Column(nullable = false)
  @CreationTimestamp
  private Date postedDate;

  @Lob
  @Column(name = "description", nullable = false, length = 10000)
  private String description;

  @Lob
  @Column(name = "requirements", nullable = false, length = 10000)
  private String requirements;

  @Lob
  @Column(name = "benefits", nullable = false, length = 10000)
  private String benefits;

  @Column(nullable = false)
  private String category;
}

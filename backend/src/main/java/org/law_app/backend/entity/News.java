package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    indexes = {
      @Index(name = "idx_news_created_at", columnList = "createdAt"),
      @Index(name = "idx_news_title", columnList = "title")
    })
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class News {
  @Id String id; // Unique identifier for the news article (slug from title)
  String title; // Title of the news article

  @Column(length = 10000)
  String subtitle; // Subtitle of the news article

  String author; // Author of the news article
  @CreationTimestamp Date createdAt; // Timestamp when the news article was created

  @Column(length = 50000)
  String fullContent; // Full HTML content from rich text editor

  String image;
}

package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.IconNews;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SectionNews {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the section news
    String title; // Title of the section news
    @Column(name = "content", nullable = false, length = 10000)
    String content; // Content of the section news
    @ManyToOne
    @JoinColumn(name = "news_id")
    News news; // Reference to the news article this section belongs to
    IconNews icon; // Icon associated with the section news
}

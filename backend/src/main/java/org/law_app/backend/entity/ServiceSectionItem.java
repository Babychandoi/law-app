package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Một mục trong ServiceSection. Ý nghĩa field tùy type của section: - benefits/conditions/cards:
 * title + description (+icon/image) - faq: title = câu hỏi, description = câu trả lời - comparison:
 * title = tiêu chí, description = cột A, secondary = cột B
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "service_section_item",
    indexes = {@Index(name = "idx_section_item_section", columnList = "section_id")})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceSectionItem {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String title;

  @Column(length = 5000)
  String description;

  @Column(length = 5000)
  String secondary;

  String icon;
  String image;
  Integer sortOrder;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "section_id")
  ServiceSection section;
}

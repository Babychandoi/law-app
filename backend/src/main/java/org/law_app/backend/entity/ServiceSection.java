package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Section nội dung chung của một trang dịch vụ. Mỗi trang có N section tùy chọn; type quyết định
 * cách hiển thị ở frontend (benefits | info | cards | conditions | faq | comparison ...).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "service_section",
    indexes = {@Index(name = "idx_service_section_service", columnList = "service_id")})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceSection {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  /** Kiểu hiển thị: benefits | info | cards | conditions | faq | comparison */
  String type;

  String title;
  String subtitle;

  /** Nội dung tự do (đoạn văn / HTML đơn giản) cho section dạng info */
  @Column(length = 10000)
  String content;

  String image;

  Integer sortOrder;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "service_id")
  ChildrenServices service;

  @Builder.Default
  @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("sortOrder ASC")
  List<ServiceSectionItem> items = new ArrayList<>();
}

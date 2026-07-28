package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Ảnh chụp một phiên bản của bài viết (News) — lưu lại TRẠNG THÁI TRƯỚC mỗi lần sửa để có thể xem
 * lại và khôi phục. Bảng tự tạo qua Hibernate ddl-auto=update.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "news_versions",
    indexes = {@Index(name = "idx_news_version_news", columnList = "newsId,createdAt")})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsVersion {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String newsId; // id (slug) của bài viết gốc
  String title;

  @Column(length = 10000)
  String subtitle;

  String author;

  @Column(length = 50000)
  String fullContent;

  String image;

  String editorId; // ai đã tạo ra bản chỉnh sửa khiến phiên bản này bị thay thế
  String editorUsername;

  @CreationTimestamp Date createdAt; // thời điểm phiên bản được lưu (ngay trước khi bị ghi đè)
}

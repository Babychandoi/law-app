package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Trang landing chạy quảng cáo cho một dịch vụ con.
 *
 * <p>Nội dung thân trang (hero/sections/quy trình/bảng giá) KHÔNG lưu ở đây — landing render lại
 * chính dữ liệu của trang dịch vụ để hai bên không bao giờ lệch nhau. Bảng này chỉ giữ phần riêng
 * của landing: đường dẫn chạy ads, trạng thái xuất bản và câu chữ quanh form thu lead.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    uniqueConstraints = {
      @UniqueConstraint(name = "uk_landing_page_slug", columnNames = "slug"),
      @UniqueConstraint(name = "uk_landing_page_service", columnNames = "service_id")
    },
    indexes = {@Index(name = "idx_landing_page_published", columnList = "published")})
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LandingPage {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  /** Phần sau /lp/ trên URL. Suy ra từ href dịch vụ khi tạo, admin đổi được để chạy chiến dịch. */
  @Column(nullable = false)
  String slug;

  /** Dịch vụ mà landing này thu lead về. Một dịch vụ có tối đa một landing. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "service_id", nullable = false)
  ChildrenServices service;

  /** Nháp thì /lp/{slug} trả 404 — tránh lộ trang chưa có nội dung ra ads/Google. */
  @Builder.Default
  @Column(nullable = false)
  boolean published = false;

  /** Chữ nhỏ phía trên tiêu đề hero. Bỏ trống thì dùng tên dịch vụ. */
  String eyebrow;

  /** Gạch đầu dòng cam kết cạnh form (USP). */
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "landing_page_hero_point",
      joinColumns = @JoinColumn(name = "landing_page_id"))
  @Column(name = "point", length = 255)
  @OrderColumn(name = "sort_order")
  @Builder.Default
  List<String> heroPoints = new ArrayList<>();

  String formTitle;
  String formSubtitle;
  String finalCtaTitle;

  @Column(length = 512)
  String finalCtaSubtitle;

  @CreationTimestamp Date createdAt;
  @UpdateTimestamp Date updatedAt;
}

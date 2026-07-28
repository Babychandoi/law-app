package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Nhật ký kiểm toán (audit log): ghi lại AI đã làm GÌ, LÚC NÀO, trên đối tượng nào — kèm diff
 * trước/sau cho các thay đổi trạng thái. Bảng tự tạo qua Hibernate ddl-auto=update.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "audit_logs",
    indexes = {
      @Index(name = "idx_audit_created", columnList = "createdAt"),
      @Index(name = "idx_audit_target", columnList = "targetType,targetId"),
      @Index(name = "idx_audit_action", columnList = "action")
    })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String actorId; // id người thực hiện (null nếu hệ thống)
  String actorUsername; // tên đăng nhập tại thời điểm ghi
  String actorRole; // vai trò tại thời điểm ghi

  String action; // mã hành động, vd USER_ROLE_CHANGED, NEWS_DELETED
  String targetType; // loại đối tượng, vd USER, CUSTOMER, NEWS, SUBSCRIBER, SERVICE
  String targetId; // id đối tượng bị tác động

  @Column(length = 512)
  String summary; // mô tả ngắn tiếng Việt để hiển thị nhanh

  @Column(length = 2000)
  String detail; // diff/ghi chú (JSON hoặc text): {"field":{"old":..,"new":..}}

  @CreationTimestamp Date createdAt;
}

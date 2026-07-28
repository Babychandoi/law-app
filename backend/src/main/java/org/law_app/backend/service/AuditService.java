package org.law_app.backend.service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.entity.AuditLog;
import org.law_app.backend.entity.User;
import org.law_app.backend.repository.AuditLogRepository;
import org.law_app.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Ghi và truy vấn nhật ký kiểm toán. Việc ghi log KHÔNG được phép làm hỏng hành động chính — mọi
 * lỗi khi ghi đều nuốt (log warn) để không ảnh hưởng nghiệp vụ.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;

  /** Ghi một mục nhật ký, tự phân giải người thực hiện từ SecurityContext. */
  public void record(
      String action, String targetType, String targetId, String summary, String detail) {
    try {
      AuditLog.AuditLogBuilder b =
          AuditLog.builder()
              .action(action)
              .targetType(targetType)
              .targetId(targetId)
              .summary(summary)
              .detail(detail);
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null && auth.getName() != null) {
        String actorId = auth.getName();
        b.actorId(actorId);
        User actor = userRepository.findById(actorId).orElse(null);
        if (actor != null) {
          b.actorUsername(actor.getUsername());
          b.actorRole(actor.getRole() != null ? actor.getRole().name() : null);
        }
      }
      auditLogRepository.save(b.build());
    } catch (Exception e) {
      log.warn("Không ghi được audit log ({} {}): {}", action, targetId, e.getMessage());
    }
  }

  /** Người thực hiện hiện tại (id + username), null nếu không có context. */
  public record Actor(String id, String username) {}

  public Actor currentActor() {
    try {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null && auth.getName() != null) {
        String id = auth.getName();
        User u = userRepository.findById(id).orElse(null);
        return new Actor(id, u != null ? u.getUsername() : null);
      }
    } catch (Exception ignored) {
      // không có context -> trả actor rỗng
    }
    return new Actor(null, null);
  }

  /** Tiện ích tạo detail dạng diff một trường: {"field":{"old":..,"new":..}}. */
  public static String diff(String field, Object oldVal, Object newVal) {
    return String.format(
        "{\"%s\":{\"old\":\"%s\",\"new\":\"%s\"}}",
        field, String.valueOf(oldVal), String.valueOf(newVal));
  }

  /* ===== Analytics luồng admin (P2.12) — tổng hợp từ audit_logs ===== */

  public record ActionCount(String action, long count) {}

  public record DayCount(String day, long count) {}

  public record StatsResponse(long total, List<ActionCount> byAction, List<DayCount> byDay) {}

  /** Thống kê hoạt động trong `days` ngày gần nhất: tổng, theo hành động, theo ngày. */
  public StatsResponse stats(int days) {
    int d = Math.max(1, Math.min(days, 365));
    Date from = new Date(System.currentTimeMillis() - (long) d * 86_400_000L);
    long total = auditLogRepository.countByCreatedAtGreaterThanEqual(from);
    List<ActionCount> byAction =
        auditLogRepository.countByAction(from).stream()
            .map(r -> new ActionCount((String) r[0], ((Number) r[1]).longValue()))
            .toList();
    java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat("yyyy-MM-dd");
    java.util.Map<String, Long> perDay = new java.util.TreeMap<>();
    for (Date dt : auditLogRepository.createdAtSince(from)) {
      if (dt != null) perDay.merge(fmt.format(dt), 1L, Long::sum);
    }
    List<DayCount> byDay = new ArrayList<>();
    perDay.forEach((k, v) -> byDay.add(new DayCount(k, v)));
    return new StatsResponse(total, byAction, byDay);
  }

  /** Danh sách nhật ký có lọc (targetType/action/keyword) + phân trang. */
  public Page<AuditLog> search(String targetType, String action, String q, Pageable pageable) {
    Specification<AuditLog> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();
          if (targetType != null && !targetType.isBlank()) {
            ps.add(cb.equal(root.get("targetType"), targetType));
          }
          if (action != null && !action.isBlank()) {
            ps.add(cb.equal(root.get("action"), action));
          }
          if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("actorUsername")), like),
                    cb.like(cb.lower(root.get("summary")), like),
                    cb.like(cb.lower(root.get("targetId")), like)));
          }
          return cb.and(ps.toArray(new Predicate[0]));
        };
    return auditLogRepository.findAll(spec, pageable);
  }
}

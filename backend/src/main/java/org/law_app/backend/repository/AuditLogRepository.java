package org.law_app.backend.repository;

import java.util.Date;
import java.util.List;
import org.law_app.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository
    extends JpaRepository<AuditLog, String>, JpaSpecificationExecutor<AuditLog> {

  /** Đếm theo loại hành động kể từ mốc thời gian (analytics P2.12). */
  @Query(
      "select a.action, count(a) from AuditLog a where a.createdAt >= :from"
          + " group by a.action order by count(a) desc")
  List<Object[]> countByAction(@Param("from") Date from);

  /**
   * Mốc thời gian các log kể từ :from — gom theo ngày ở tầng service (tránh phụ thuộc tên cột/DB).
   */
  @Query("select a.createdAt from AuditLog a where a.createdAt >= :from")
  List<Date> createdAtSince(@Param("from") Date from);

  long countByCreatedAtGreaterThanEqual(Date from);
}

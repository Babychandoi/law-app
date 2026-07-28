package org.law_app.backend.repository;

import org.law_app.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditLogRepository
    extends JpaRepository<AuditLog, String>, JpaSpecificationExecutor<AuditLog> {}

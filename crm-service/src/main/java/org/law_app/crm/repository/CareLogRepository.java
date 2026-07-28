package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CareLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareLogRepository extends JpaRepository<CareLog, Long> {
  List<CareLog> findByCaseIdOrderByCreatedAtDesc(String caseId);
}

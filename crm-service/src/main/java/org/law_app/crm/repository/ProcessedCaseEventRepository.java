package org.law_app.crm.repository;

import java.time.Instant;
import org.law_app.crm.domain.ProcessedCaseEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProcessedCaseEventRepository extends JpaRepository<ProcessedCaseEvent, String> {

  @Modifying
  @Query("delete from ProcessedCaseEvent e where e.processedAt < :cutoff")
  int deleteProcessedBefore(@Param("cutoff") Instant cutoff);
}

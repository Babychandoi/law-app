package org.law_app.backend.repository;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import org.law_app.backend.entity.OutboxEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query(
      """
      select e from OutboxEvent e
      where e.publishedAt is null
        and (e.nextAttemptAt is null or e.nextAttemptAt <= :now)
      order by e.occurredAt asc
      """)
  List<OutboxEvent> lockNextBatch(@Param("now") Instant now, Pageable pageable);

  @Modifying
  @Query("delete from OutboxEvent e where e.publishedAt is not null and e.publishedAt < :cutoff")
  int deletePublishedBefore(@Param("cutoff") Instant cutoff);
}

package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CareStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareStatusRepository extends JpaRepository<CareStatus, Long> {
  List<CareStatus> findAllByOrderBySortOrderAsc();

  CareStatus findFirstByIsDefaultTrue();

  long countByActiveTrue();
}

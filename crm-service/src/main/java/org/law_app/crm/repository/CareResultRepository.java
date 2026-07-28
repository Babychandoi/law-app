package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CareResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareResultRepository extends JpaRepository<CareResult, Long> {
  List<CareResult> findAllByOrderBySortOrderAsc();

  long countByActiveTrue();
}

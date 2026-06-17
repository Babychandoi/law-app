package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CareAction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareActionRepository extends JpaRepository<CareAction, Long> {
  List<CareAction> findAllByOrderBySortOrderAsc();

  long countByActiveTrue();
}

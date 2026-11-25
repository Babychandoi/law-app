package org.law_app.crm.repository;

import java.util.Optional;
import org.law_app.crm.domain.CrmLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmLeadRepository
    extends JpaRepository<CrmLead, String>, JpaSpecificationExecutor<CrmLead> {

  boolean existsByCode(String code);

  boolean existsBySourceCaseId(String sourceCaseId);

  Optional<CrmLead> findBySourceCaseId(String sourceCaseId);

  Optional<CrmLead> findTopByCodeStartingWithOrderByCodeDesc(String prefix);
}

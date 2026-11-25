package org.law_app.crm.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.crm.domain.CrmOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmOpportunityRepository
    extends JpaRepository<CrmOpportunity, String>, JpaSpecificationExecutor<CrmOpportunity> {

  boolean existsByCode(String code);

  Optional<CrmOpportunity> findTopByCodeStartingWithOrderByCodeDesc(String prefix);

  List<CrmOpportunity> findByAccountIdOrderByCreatedAtDesc(String accountId);
}

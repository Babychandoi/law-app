package org.law_app.crm.repository;

import java.util.Collection;
import java.util.List;
import org.law_app.crm.domain.CrmOpportunityItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmOpportunityItemRepository extends JpaRepository<CrmOpportunityItem, String> {

  List<CrmOpportunityItem> findByOpportunityIdOrderBySortOrderAsc(String opportunityId);

  List<CrmOpportunityItem> findByOpportunityIdInOrderBySortOrderAsc(
      Collection<String> opportunityIds);

  void deleteByOpportunityId(String opportunityId);
}

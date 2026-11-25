package org.law_app.crm.repository;

import java.util.Collection;
import java.util.List;
import org.law_app.crm.domain.CrmContractItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmContractItemRepository extends JpaRepository<CrmContractItem, String> {

  List<CrmContractItem> findByContractIdOrderBySortOrderAsc(String contractId);

  List<CrmContractItem> findByContractIdInOrderBySortOrderAsc(Collection<String> contractIds);

  void deleteByContractId(String contractId);
}

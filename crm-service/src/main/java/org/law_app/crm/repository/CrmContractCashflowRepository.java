package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CrmContractCashflow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmContractCashflowRepository extends JpaRepository<CrmContractCashflow, String> {

  List<CrmContractCashflow> findByContractIdOrderByTransactionDateDescCreatedAtDesc(
      String contractId);

  List<CrmContractCashflow> findByContractIdAndTypeOrderByTransactionDateDescCreatedAtDesc(
      String contractId, String type);

  void deleteByContractId(String contractId);
}

package org.law_app.crm.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.crm.domain.CrmContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmContractRepository
    extends JpaRepository<CrmContract, String>, JpaSpecificationExecutor<CrmContract> {

  boolean existsByContractNumber(String contractNumber);

  Optional<CrmContract> findTopByContractNumberStartingWithOrderByContractNumberDesc(String prefix);

  List<CrmContract> findByAccountIdOrderByBookingDateDescCreatedAtDesc(String accountId);
}

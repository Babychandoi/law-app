package org.law_app.crm.repository;

import java.util.Optional;
import org.law_app.crm.domain.CrmAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmAccountRepository
    extends JpaRepository<CrmAccount, String>, JpaSpecificationExecutor<CrmAccount> {

  boolean existsByCode(String code);

  Optional<CrmAccount> findTopByCodeStartingWithOrderByCodeDesc(String prefix);
}

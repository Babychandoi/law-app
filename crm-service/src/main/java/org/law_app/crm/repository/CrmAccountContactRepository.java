package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CrmAccountContact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmAccountContactRepository extends JpaRepository<CrmAccountContact, String> {

  List<CrmAccountContact> findByAccountIdOrderByPrimaryContactDescCreatedAtAsc(String accountId);

  void deleteByAccountId(String accountId);
}

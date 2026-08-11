package org.law_app.crm.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.crm.domain.MatterParty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatterPartyRepository extends JpaRepository<MatterParty, String> {

  Optional<MatterParty> findByIdAndCaseId(String id, String caseId);

  Page<MatterParty> findByCaseId(String caseId, Pageable pageable);

  Page<MatterParty> findByCaseIdAndArchivedFalse(String caseId, Pageable pageable);

  /** Active parties only; document context must never surface archived records. */
  List<MatterParty> findByCaseIdAndArchivedFalseOrderByCreatedAtAsc(String caseId);
}

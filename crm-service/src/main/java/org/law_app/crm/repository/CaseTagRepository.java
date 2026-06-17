package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CaseTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseTagRepository extends JpaRepository<CaseTag, Long> {
  List<CaseTag> findByCaseId(String caseId);

  List<CaseTag> findByTagId(Long tagId);

  void deleteByCaseIdAndTagId(String caseId, Long tagId);

  boolean existsByCaseIdAndTagId(String caseId, Long tagId);
}

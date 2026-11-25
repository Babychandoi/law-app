package org.law_app.crm.repository;

import java.util.List;
import org.law_app.crm.domain.CrmActivity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmActivityRepository extends JpaRepository<CrmActivity, String> {

  List<CrmActivity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
      String entityType, String entityId);

  List<CrmActivity> findByEntityIdOrderByCreatedAtDesc(String entityId);

  List<CrmActivity> findTop50ByEntityTypeOrderByCreatedAtDesc(String entityType);

  List<CrmActivity> findTop50ByOrderByCreatedAtDesc();
}

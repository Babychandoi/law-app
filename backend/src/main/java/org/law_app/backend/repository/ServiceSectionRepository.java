package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.ServiceSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceSectionRepository extends JpaRepository<ServiceSection, String> {
  List<ServiceSection> findByServiceOrderBySortOrderAsc(ChildrenServices service);

  void deleteByService(ChildrenServices service);
}

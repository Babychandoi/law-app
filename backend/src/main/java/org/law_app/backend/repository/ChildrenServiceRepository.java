package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChildrenServiceRepository extends JpaRepository<ChildrenServices, String> {
  List<ChildrenServices> findByParentService(Services services);

  List<ChildrenServices> findByParentServiceIn(List<Services> services);

  java.util.Optional<ChildrenServices> findByHref(String href);
}

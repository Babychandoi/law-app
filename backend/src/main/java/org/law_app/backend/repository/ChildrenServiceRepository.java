package org.law_app.backend.repository;

import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildrenServiceRepository extends JpaRepository<ChildrenServices, String> {
    List<ChildrenServices> findByParentService(Services services);
}

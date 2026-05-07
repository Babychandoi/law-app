package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessRepository extends JpaRepository<Process, String> {
  List<Process> findByService(ChildrenServices service);
}

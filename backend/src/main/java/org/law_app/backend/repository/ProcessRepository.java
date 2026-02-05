package org.law_app.backend.repository;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessRepository extends JpaRepository<Process, String> {
    List<Process> findByService(ChildrenServices service);
}

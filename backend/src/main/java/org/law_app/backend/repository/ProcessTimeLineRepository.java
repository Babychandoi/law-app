package org.law_app.backend.repository;

import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.ProcessTimeLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessTimeLineRepository extends JpaRepository<ProcessTimeLine, String> {
    List<ProcessTimeLine> findByService(ChildrenServices service);
}

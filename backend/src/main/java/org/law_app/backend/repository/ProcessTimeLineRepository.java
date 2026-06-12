package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.ProcessTimeLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessTimeLineRepository extends JpaRepository<ProcessTimeLine, String> {
  List<ProcessTimeLine> findByService(ChildrenServices service);
}

package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.Process;
import org.law_app.backend.entity.ProcessDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessDetailRepository extends JpaRepository<ProcessDetail, String> {
  List<ProcessDetail> findByProcess(Process process);

  void deleteByProcess(Process process);
}

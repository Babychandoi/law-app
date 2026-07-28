package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Services, String> {
  List<Services> findAllByTitle(String title);
}

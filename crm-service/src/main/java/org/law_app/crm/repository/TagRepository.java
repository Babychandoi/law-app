package org.law_app.crm.repository;

import org.law_app.crm.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
  long countByActiveTrue();
}

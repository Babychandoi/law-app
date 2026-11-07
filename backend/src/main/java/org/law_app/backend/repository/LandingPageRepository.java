package org.law_app.backend.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LandingPageRepository extends JpaRepository<LandingPage, String> {

  Optional<LandingPage> findBySlug(String slug);

  Optional<LandingPage> findByService(ChildrenServices service);

  boolean existsBySlug(String slug);

  void deleteByService(ChildrenServices service);

  @Query("select l from LandingPage l join fetch l.service order by l.slug asc")
  List<LandingPage> findAllWithService();
}

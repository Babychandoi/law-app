package org.law_app.backend.repository;

import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Hero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HeroRepository extends JpaRepository<Hero, String> {
    Hero findByService(ChildrenServices services);
}

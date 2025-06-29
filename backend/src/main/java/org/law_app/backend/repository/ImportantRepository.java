package org.law_app.backend.repository;

import org.law_app.backend.entity.Important;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportantRepository extends JpaRepository<Important, String> {
    // This repository interface will handle CRUD operations for ImportantEntity entities
    // Additional custom query methods can be defined here if needed
}

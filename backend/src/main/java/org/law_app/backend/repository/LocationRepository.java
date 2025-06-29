package org.law_app.backend.repository;

import org.law_app.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {
    // This repository interface will handle CRUD operations for Location entities
    // Additional custom query methods can be defined here if needed
}

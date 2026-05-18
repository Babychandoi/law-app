package org.law_app.backend.repository;

import org.law_app.backend.entity.Social;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocialRepository extends JpaRepository<Social, String> {
    // This repository interface will handle CRUD operations for Social entities
    // Additional custom query methods can be defined here if needed
}

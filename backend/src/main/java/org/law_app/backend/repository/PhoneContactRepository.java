package org.law_app.backend.repository;

import org.law_app.backend.entity.PhoneContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhoneContactRepository extends JpaRepository<PhoneContact, String> {
    // This repository interface will handle CRUD operations for PhoneContact entities
    // Additional custom query methods can be defined here if needed
}

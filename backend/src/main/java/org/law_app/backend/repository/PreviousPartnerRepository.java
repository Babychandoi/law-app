package org.law_app.backend.repository;

import org.law_app.backend.entity.PreviousPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreviousPartnerRepository extends JpaRepository<PreviousPartner, String> {
    // Additional query methods can be defined here if needed
}

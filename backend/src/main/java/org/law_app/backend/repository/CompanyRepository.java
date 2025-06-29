package org.law_app.backend.repository;

import org.law_app.backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {
    // Define custom query methods if needed
    // For example, to find a company by its name:
    // Optional<Company> findByName(String name);
}

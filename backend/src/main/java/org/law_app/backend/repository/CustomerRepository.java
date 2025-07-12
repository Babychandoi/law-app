package org.law_app.backend.repository;

import org.law_app.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    // Additional query methods can be defined here if needed
    Boolean existsByEmailAndPhone(String email, String phone);
    Customer findByEmailAndPhone(String email, String phone);
}

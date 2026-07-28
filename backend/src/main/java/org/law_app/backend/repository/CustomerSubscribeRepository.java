package org.law_app.backend.repository;

import org.law_app.backend.entity.CustomerSubscribe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerSubscribeRepository extends JpaRepository<CustomerSubscribe, String> {
  boolean existsByEmail(String email);

  Page<CustomerSubscribe> findByEmailContainingIgnoreCase(String email, Pageable pageable);
}

package org.law_app.backend.repository;

import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.CustomerService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerServiceRepository extends JpaRepository<CustomerService, String> {
    List<CustomerService> findByService(ChildrenServices service);
}

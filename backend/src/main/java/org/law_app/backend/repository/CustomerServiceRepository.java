package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.common.Status;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerServiceRepository
    extends JpaRepository<CustomerService, String>, JpaSpecificationExecutor<CustomerService> {
  @Override
  @EntityGraph(attributePaths = {"customer", "service"})
  Page<CustomerService> findAll(Specification<CustomerService> spec, Pageable pageable);

  interface StatusCount {
    Status getStatus();

    long getCount();
  }

  @Query("select c.status as status, count(c) as count from CustomerService c group by c.status")
  List<StatusCount> countByStatus();

  @EntityGraph(attributePaths = {"customer", "service"})
  Page<CustomerService> findAll(Pageable pageable);

  @EntityGraph(attributePaths = {"customer", "service"})
  List<CustomerService> findAll();

  @EntityGraph(attributePaths = {"customer", "service"})
  List<CustomerService> findByService(ChildrenServices service);

  @EntityGraph(attributePaths = {"customer", "service"})
  Page<CustomerService> findByService(ChildrenServices service, Pageable pageable);
}

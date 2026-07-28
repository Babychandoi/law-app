package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, String> {
  List<Pricing> findByService(ChildrenServices service);

  List<Pricing> findByServiceOrderBySortOrderAsc(ChildrenServices service);

  void deleteByService(ChildrenServices service);
}

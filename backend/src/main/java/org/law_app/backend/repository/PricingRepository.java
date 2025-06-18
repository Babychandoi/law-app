package org.law_app.backend.repository;

import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, String> {
    List<Pricing> findByService(ChildrenServices service);

}

package org.law_app.backend.repository;

import org.law_app.backend.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Services,String> {
    List<Services> findAllByTitle(String title);
}

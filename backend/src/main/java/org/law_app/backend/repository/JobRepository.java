package org.law_app.backend.repository;

import org.law_app.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, String>, JpaSpecificationExecutor<Job> {
    // Additional query methods can be defined here if needed
}

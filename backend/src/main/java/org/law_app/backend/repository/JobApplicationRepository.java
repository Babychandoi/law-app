package org.law_app.backend.repository;

import org.law_app.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, String> {
    List<JobApplication> findByJobId(String jobId);
    List<JobApplication> findByStatus(String status);
    List<JobApplication> findByCandidateEmail(String email);
}

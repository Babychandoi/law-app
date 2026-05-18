package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.response.JobResponse;
import org.law_app.backend.entity.Job;
import org.law_app.backend.mapper.JobMapper;
import org.law_app.backend.repository.JobRepository;
import org.law_app.backend.repository.specification.JobSpecification;
import org.law_app.backend.service.JobService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class JobServiceImpl implements JobService {
    JobRepository jobRepository;
    JobMapper jobMapper;
    @Override
    @Transactional
    public Boolean createJob(JobRequest jobRequest) {
        try {
            jobRepository.save(jobMapper.toJob(jobRequest));
            return true;
        } catch (Exception e) {
            log.error("Error creating job: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public List<JobResponse> getAllJobs() {
        try {
            return jobRepository.findAll().stream()
                    .map(jobMapper::toJobResponse)
                    .toList();
        }catch (Exception e) {
            log.error("Error fetching jobs: {}", e.getMessage());
            throw  e;
        }
    }

    @Override
    public JobResponse getJobById(String id) {
        try {
            return jobRepository.findById(id)
                    .map(jobMapper::toJobResponse)
                    .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        } catch (Exception e) {
            log.error("Error fetching job by id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<JobResponse> searchJobs(String keywords, String category, String jobType, String location) {
        try {
            Specification<Job> spec = JobSpecification.searchJobs(keywords, category, jobType, location);

            return jobRepository.findAll(spec).stream()
                    .map(jobMapper::toJobResponse)
                    .toList();
        } catch (Exception e) {
            log.error("Error searching jobs: {}", e.getMessage());
            throw e;
        }
    }
}

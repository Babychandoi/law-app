package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobService {
  Boolean createJob(JobRequest jobRequest);

  List<JobResponse> getAllJobs();

  Page<JobResponse> getAllJobs(Pageable pageable);

  JobResponse getJobById(String id);

  List<JobResponse> searchJobs(String keywords, String category, String jobType, String location);

  Page<JobResponse> searchJobs(
      String keywords, String category, String jobType, String location, Pageable pageable);
}

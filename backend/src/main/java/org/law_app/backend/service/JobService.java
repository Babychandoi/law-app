package org.law_app.backend.service;

import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.response.JobResponse;

import java.util.List;

public interface JobService {
    Boolean createJob(JobRequest jobRequest);
    List<JobResponse> getAllJobs();
    JobResponse getJobById(String id);
    List<JobResponse> searchJobs(String keywords, String category, String jobType, String location);
}

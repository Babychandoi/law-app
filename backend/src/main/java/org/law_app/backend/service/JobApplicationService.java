package org.law_app.backend.service;

import org.law_app.backend.dto.request.JobApplicationRequest;
import org.law_app.backend.dto.response.JobApplicationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JobApplicationService {
    JobApplicationResponse submitApplication(JobApplicationRequest request, MultipartFile cvFile) throws Exception;
    List<JobApplicationResponse> getAllApplications();
    List<JobApplicationResponse> getApplicationsByJobId(String jobId);
    JobApplicationResponse getApplicationById(String id);
    JobApplicationResponse updateApplicationStatus(String id, String status, String notes);
    void deleteApplication(String id);
}


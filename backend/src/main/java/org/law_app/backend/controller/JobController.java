package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.request.JobApplicationRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.JobResponse;
import org.law_app.backend.dto.response.JobApplicationResponse;
import org.law_app.backend.service.JobService;
import org.law_app.backend.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class JobController {
    JobService jobService;
    JobApplicationService jobApplicationService;
    
    @PostMapping
    public ApiResponse<Boolean> createJob(@RequestBody JobRequest jobRequest) {
        return ApiResponse.<Boolean>builder()
                .message("Job created successfully")
                .data(jobService.createJob(jobRequest))
                .build();
    }
    
    @GetMapping
    public ApiResponse<List<JobResponse>> getAllJobs() {
        return ApiResponse.<List<JobResponse>>builder()
                .message("Jobs retrieved successfully")
                .data(jobService.getAllJobs())
                .build();
    }
    
    @GetMapping("/{id}")
    public ApiResponse<JobResponse> getJobById(@PathVariable String id) {
        return ApiResponse.<JobResponse>builder()
                .message("Job retrieved successfully")
                .data(jobService.getJobById(id))
                .build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<JobResponse>>> searchJobs(
            @RequestParam(required = false) String keywords,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(
                ApiResponse.<List<JobResponse>>builder()
                        .message("Jobs retrieved successfully")
                        .data(jobService.searchJobs(keywords, category, jobType, location))
                        .build()
        );
    }
    
    /**
     * Submit job application with CV upload
     * POST /jobs/apply
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> submitApplication(
            @RequestParam("jobId") String jobId,
            @RequestParam("jobTitle") String jobTitle,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam(value = "candidatePhone", required = false) String candidatePhone,
            @RequestParam("cvFile") MultipartFile cvFile) {
        
        try {
            JobApplicationRequest request = JobApplicationRequest.builder()
                    .jobId(jobId)
                    .jobTitle(jobTitle)
                    .candidateName(candidateName)
                    .candidateEmail(candidateEmail)
                    .candidatePhone(candidatePhone)
                    .build();
            
            JobApplicationResponse response = jobApplicationService.submitApplication(request, cvFile);
            
            return ResponseEntity.ok(
                    ApiResponse.<JobApplicationResponse>builder()
                            .code(200)
                            .message("Application submitted successfully")
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<JobApplicationResponse>builder()
                            .code(400)
                            .message("Failed to submit application: " + e.getMessage())
                            .build()
            );
        }
    }
    
    /**
     * Get all applications (admin)
     * GET /jobs/applications
     */
    @GetMapping("/applications")
    public ApiResponse<List<JobApplicationResponse>> getAllApplications() {
        return ApiResponse.<List<JobApplicationResponse>>builder()
                .message("Applications retrieved successfully")
                .data(jobApplicationService.getAllApplications())
                .build();
    }
    
    /**
     * Get applications by job ID
     * GET /jobs/{jobId}/applications
     */
    @GetMapping("/{jobId}/applications")
    public ApiResponse<List<JobApplicationResponse>> getApplicationsByJobId(@PathVariable String jobId) {
        return ApiResponse.<List<JobApplicationResponse>>builder()
                .message("Applications retrieved successfully")
                .data(jobApplicationService.getApplicationsByJobId(jobId))
                .build();
    }
}

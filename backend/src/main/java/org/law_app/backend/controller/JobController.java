package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.JobResponse;
import org.law_app.backend.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class JobController {
    JobService jobService;
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
}

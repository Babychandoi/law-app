package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.JobApplicationRequest;
import org.law_app.backend.dto.response.JobApplicationResponse;
import org.law_app.backend.entity.JobApplication;
import org.law_app.backend.repository.JobApplicationRepository;
import org.law_app.backend.security.MinioConfig;
import org.law_app.backend.service.MinioService;
import org.law_app.backend.service.JobApplicationService;
import org.law_app.backend.service.JobApplicationEmailService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final MinioService minioService;
    private final MinioConfig minioConfig;
    private final JobApplicationEmailService emailService;

    @Override
    public JobApplicationResponse submitApplication(JobApplicationRequest request, MultipartFile cvFile) throws Exception {
        try {
            // Validate file
            if (cvFile == null || cvFile.isEmpty()) {
                throw new IllegalArgumentException("CV file is required");
            }

            // Validate file type
            String contentType = cvFile.getContentType();
            if (contentType == null || 
                (!contentType.equals("application/pdf") && 
                 !contentType.equals("application/msword") && 
                 !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                throw new IllegalArgumentException("Only PDF, DOC, and DOCX files are allowed");
            }

            // Validate file size (max 10MB)
            if (cvFile.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("File size must not exceed 10MB");
            }

            // Generate unique file name
            String originalFileName = cvFile.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".") 
                ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
                : "";
            String uniqueFileName = String.format("CV_%s_%s_%d%s", 
                request.getCandidateName().replaceAll("[^a-zA-Z0-9]", "_"),
                request.getJobTitle().replaceAll("[^a-zA-Z0-9]", "_"),
                System.currentTimeMillis(),
                fileExtension
            );

            // Upload to MinIO
            log.info("Uploading CV to MinIO: {}", uniqueFileName);
            String minioFileName = minioService.uploadCV(cvFile);
            String cvUrl = minioService.generateFileUrl(minioConfig.getCvsBucket(), minioFileName);

            // Save application to database
            JobApplication application = JobApplication.builder()
                    .jobId(request.getJobId())
                    .jobTitle(request.getJobTitle())
                    .candidateName(request.getCandidateName())
                    .candidateEmail(request.getCandidateEmail())
                    .candidatePhone(request.getCandidatePhone())
                    .cvFileUrl(cvUrl)
                    .cvFileName(minioFileName)
                    .status("PENDING")
                    .build();

            JobApplication savedApplication = jobApplicationRepository.save(application);
            log.info("Job application saved: {} for job: {}", savedApplication.getId(), request.getJobTitle());

            // Send confirmation email asynchronously
            emailService.sendApplicationConfirmationEmail(
                request.getCandidateEmail(),
                request.getCandidateName(),
                request.getJobTitle()
            );

            return mapToResponse(savedApplication);

        } catch (Exception e) {
            log.error("Error submitting job application: {}", e.getMessage(), e);
            throw new Exception("Failed to submit application: " + e.getMessage());
        }
    }

    @Override
    public List<JobApplicationResponse> getAllApplications() {
        return jobApplicationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplicationResponse> getApplicationsByJobId(String jobId) {
        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobApplicationResponse getApplicationById(String id) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return mapToResponse(application);
    }

    @Override
    public JobApplicationResponse updateApplicationStatus(String id, String status, String notes) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(status);
        if (notes != null) {
            application.setNotes(notes);
        }
        
        JobApplication updated = jobApplicationRepository.save(application);
        log.info("Application status updated: {} -> {}", id, status);
        
        // Send status update email asynchronously
        emailService.sendStatusUpdateEmail(
            updated.getCandidateEmail(),
            updated.getCandidateName(),
            updated.getJobTitle(),
            status
        );
        
        return mapToResponse(updated);
    }

    @Override
    public void deleteApplication(String id) {
        jobApplicationRepository.deleteById(id);
        log.info("Application deleted: {}", id);
    }

    private JobApplicationResponse mapToResponse(JobApplication application) {
        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .jobTitle(application.getJobTitle())
                .candidateName(application.getCandidateName())
                .candidateEmail(application.getCandidateEmail())
                .candidatePhone(application.getCandidatePhone())
                .cvFileUrl(application.getCvFileUrl())
                .cvFileName(application.getCvFileName())
                .status(application.getStatus())
                .appliedDate(application.getAppliedDate())
                .notes(application.getNotes())
                .build();
    }
}

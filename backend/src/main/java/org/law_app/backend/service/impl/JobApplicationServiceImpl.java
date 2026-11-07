package org.law_app.backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.JobApplicationRequest;
import org.law_app.backend.dto.response.JobApplicationResponse;
import org.law_app.backend.entity.JobApplication;
import org.law_app.backend.repository.JobApplicationRepository;
import org.law_app.backend.security.MinioConfig;
import org.law_app.backend.service.JobApplicationEmailService;
import org.law_app.backend.service.JobApplicationService;
import org.law_app.backend.service.MinioService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

  private final JobApplicationRepository jobApplicationRepository;
  private final MinioService minioService;
  private final MinioConfig minioConfig;
  private final JobApplicationEmailService emailService;

  @Override
  public JobApplicationResponse submitApplication(
      JobApplicationRequest request, MultipartFile cvFile) throws Exception {
    String uploadedObject = null;
    boolean persisted = false;
    try {
      // Validate file
      if (cvFile == null || cvFile.isEmpty()) {
        throw new IllegalArgumentException("CV file is required");
      }

      // Validate file type
      String contentType = cvFile.getContentType();
      if (contentType == null
          || (!contentType.equals("application/pdf")
              && !contentType.equals("application/msword")
              && !contentType.equals(
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
        throw new IllegalArgumentException("Only PDF, DOC, and DOCX files are allowed");
      }

      // Validate file size (max 10MB)
      if (cvFile.getSize() > 10 * 1024 * 1024) {
        throw new IllegalArgumentException("File size must not exceed 10MB");
      }

      // Upload to MinIO
      uploadedObject = minioService.uploadCV(cvFile);

      // Save application to database
      JobApplication application =
          JobApplication.builder()
              .jobId(request.getJobId())
              .jobTitle(request.getJobTitle())
              .candidateName(request.getCandidateName())
              .candidateEmail(request.getCandidateEmail())
              .candidatePhone(request.getCandidatePhone())
              .cvFileUrl("private-object")
              .cvFileName(uploadedObject)
              .status("PENDING")
              .build();

      JobApplication savedApplication = jobApplicationRepository.save(application);
      persisted = true;
      log.info(
          "Job application saved: {} for job id: {}", savedApplication.getId(), request.getJobId());

      // Send confirmation email asynchronously
      emailService.sendApplicationConfirmationEmail(
          request.getCandidateEmail(), request.getCandidateName(), request.getJobTitle());

      return mapToResponse(savedApplication);

    } catch (Exception e) {
      if (!persisted && uploadedObject != null) {
        try {
          minioService.delete(minioConfig.getCvsBucket(), uploadedObject);
        } catch (RuntimeException cleanupError) {
          log.warn("CV compensation cleanup failed");
        }
      }
      log.warn("Job application submission failed: {}", e.getClass().getSimpleName());
      throw new Exception("Failed to submit application");
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
    JobApplication application =
        jobApplicationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    return mapToResponse(application);
  }

  @Override
  public JobApplicationResponse updateApplicationStatus(String id, String status, String notes) {
    JobApplication application =
        jobApplicationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    application.setStatus(status);
    if (notes != null) {
      application.setNotes(notes);
    }

    JobApplication updated = jobApplicationRepository.save(application);
    log.info("Application status updated: {} -> {}", id, status);

    // Send status update email asynchronously
    emailService.sendStatusUpdateEmail(
        updated.getCandidateEmail(), updated.getCandidateName(), updated.getJobTitle(), status);

    return mapToResponse(updated);
  }

  @Override
  public void deleteApplication(String id) {
    JobApplication application =
        jobApplicationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    minioService.delete(minioConfig.getCvsBucket(), application.getCvFileName());
    jobApplicationRepository.delete(application);
    log.info("Application deleted: {}", id);
  }

  @Override
  public MinioService.DownloadFile downloadCv(String id) {
    JobApplication application =
        jobApplicationRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    String originalName =
        application.getCvFileName() == null ? "candidate-cv" : application.getCvFileName();
    return minioService.download(
        minioConfig.getCvsBucket(), application.getCvFileName(), originalName);
  }

  private JobApplicationResponse mapToResponse(JobApplication application) {
    return JobApplicationResponse.builder()
        .id(application.getId())
        .jobId(application.getJobId())
        .jobTitle(application.getJobTitle())
        .candidateName(application.getCandidateName())
        .candidateEmail(application.getCandidateEmail())
        .candidatePhone(application.getCandidatePhone())
        // Private object storage is never returned directly. The API checks ADMIN authorization
        // and records every download.
        .cvFileUrl("/jobs/applications/" + application.getId() + "/cv")
        .cvFileName(application.getCvFileName())
        .status(application.getStatus())
        .appliedDate(application.getAppliedDate())
        .notes(application.getNotes())
        .build();
  }
}

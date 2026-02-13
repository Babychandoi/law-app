package org.law_app.backend.service;

public interface JobApplicationEmailService {
    void sendApplicationConfirmationEmail(String candidateEmail, String candidateName, String jobTitle);
    void sendStatusUpdateEmail(String candidateEmail, String candidateName, String jobTitle, String status);
}

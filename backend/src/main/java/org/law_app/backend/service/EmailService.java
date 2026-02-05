package org.law_app.backend.service;

import org.springframework.scheduling.annotation.Async;

public interface EmailService {
    @Async
    void sendEmail(String recipientEmail, String subject, String content);
}

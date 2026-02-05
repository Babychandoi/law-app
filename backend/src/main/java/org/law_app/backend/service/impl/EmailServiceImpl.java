package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@law-app.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendEmail(String email, String title, String content) {
        try {
            validateEmailInput(email, title, content);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(title);
            helper.setText(content, true); // true indicates HTML content

            mailSender.send(message);

            log.info("Email sent successfully to: {}", email);

        } catch (MessagingException e) {
            log.error("Failed to send email to {} due to messaging error: {}", email, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid email parameters: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while sending email to {}: {}", email, e.getMessage(), e);
        }
    }

    private void validateEmailInput(String email, String title, String content) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address must not be null or empty");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Email title must not be null or empty");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Email content must not be null or empty");
        }
        // Basic email format validation
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }
    }
}
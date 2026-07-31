package org.law_app.document.service;

import lombok.extern.slf4j.Slf4j;
import org.law_app.document.web.Dtos.CreateShareRequest;
import org.law_app.document.web.Dtos.ShareLinkResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Gửi tài liệu cho khách qua email dưới dạng LINK CHIA SẺ BẢO MẬT (không đính kèm file nhạy cảm vào
 * email). Tắt mặc định; bật khi đã cấu hình SMTP (spring.mail.*) + DOCUMENT_MAIL_ENABLED=true.
 */
@Slf4j
@Service
public class DocumentEmailService {

  private final boolean enabled;
  private final String from;
  private final String publicBaseUrl;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;
  private final DocumentShareService shareService;

  public DocumentEmailService(
      @Value("${document.mail.enabled:false}") boolean enabled,
      @Value("${document.mail.from:no-reply@luatpoip.com}") String from,
      @Value("${document.share.public-base-url:}") String publicBaseUrl,
      ObjectProvider<JavaMailSender> mailSenderProvider,
      DocumentShareService shareService) {
    this.enabled = enabled;
    this.from = from;
    this.publicBaseUrl = publicBaseUrl == null ? "" : publicBaseUrl.replaceAll("/$", "");
    this.mailSenderProvider = mailSenderProvider;
    this.shareService = shareService;
  }

  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public void sendShareLink(
      String generatedDocumentId,
      String to,
      String message,
      Integer expiresInHours,
      Integer maxDownloads) {
    if (!enabled) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Gửi email chưa được bật trên hệ thống");
    }
    if (publicBaseUrl.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình URL công khai để chèn vào email");
    }
    JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SMTP chưa được cấu hình");
    }

    ShareLinkResponse share =
        shareService.create(
            generatedDocumentId, new CreateShareRequest(expiresInHours, maxDownloads));
    String url = publicBaseUrl + share.path();

    SimpleMailMessage email = new SimpleMailMessage();
    email.setFrom(from);
    email.setTo(to);
    email.setSubject("Tài liệu từ Luật POIP");
    StringBuilder body = new StringBuilder();
    body.append("Kính gửi Quý khách,\n\n");
    if (message != null && !message.isBlank()) {
      body.append(message.trim()).append("\n\n");
    }
    body.append("Vui lòng tải tài liệu qua liên kết bảo mật sau:\n");
    body.append(url).append("\n\n");
    if (share.expiresAt() != null) {
      body.append("Liên kết sẽ hết hạn vào: ").append(share.expiresAt()).append("\n");
    }
    body.append("\nTrân trọng,\nLuật POIP");
    email.setText(body.toString());

    try {
      mailSender.send(email);
    } catch (Exception e) {
      log.error("Sending document email failed: {}", e.getClass().getSimpleName());
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gửi được email");
    }
  }
}

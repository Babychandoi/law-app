package org.law_app.backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.service.JobApplicationEmailService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobApplicationEmailServiceImpl implements JobApplicationEmailService {

  private final JavaMailSender mailSender;

  @Async
  @Override
  public void sendApplicationConfirmationEmail(
      String candidateEmail, String candidateName, String jobTitle) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(candidateEmail);
      helper.setSubject("✅ Xác nhận đơn ứng tuyển - " + jobTitle);
      helper.setText(buildConfirmationEmailHtml(candidateName, jobTitle), true);

      mailSender.send(message);
      log.info("Confirmation email sent to: {}", candidateEmail);
    } catch (MessagingException e) {
      log.error("Failed to send confirmation email to {}: {}", candidateEmail, e.getMessage());
    }
  }

  @Async
  @Override
  public void sendStatusUpdateEmail(
      String candidateEmail, String candidateName, String jobTitle, String status) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(candidateEmail);
      helper.setSubject(getEmailSubject(status, jobTitle));
      helper.setText(buildStatusUpdateEmailHtml(candidateName, jobTitle, status), true);

      mailSender.send(message);
      log.info("Status update email sent to: {} with status: {}", candidateEmail, status);
    } catch (MessagingException e) {
      log.error("Failed to send status update email to {}: {}", candidateEmail, e.getMessage());
    }
  }

  private String getEmailSubject(String status, String jobTitle) {
    switch (status) {
      case "REVIEWING":
        return "🔍 Đơn ứng tuyển đang được xem xét - " + jobTitle;
      case "ACCEPTED":
        return "🎉 Chúc mừng! Đơn ứng tuyển được chấp nhận - " + jobTitle;
      case "REJECTED":
        return "📋 Thông báo kết quả ứng tuyển - " + jobTitle;
      default:
        return "📬 Cập nhật trạng thái ứng tuyển - " + jobTitle;
    }
  }

  private String buildConfirmationEmailHtml(String candidateName, String jobTitle) {
    return String.format(
        """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">✅ Xác Nhận Đơn Ứng Tuyển</h1>
                    </div>
                    <div class="content">
                        <p>Kính gửi <strong>%s</strong>,</p>

                        <p>Chúng tôi đã nhận được đơn ứng tuyển của bạn cho vị trí:</p>

                        <div class="highlight">
                            <strong>📋 Vị trí: %s</strong>
                        </div>

                        <p>Đơn ứng tuyển của bạn đang được xem xét bởi đội ngũ tuyển dụng của chúng tôi. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>

                        <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này.</p>

                        <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Tuyển dụng - Luật Poip</strong></p>
                    </div>
                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                        <p>© 2026 Luật Poip. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
        candidateName, jobTitle);
  }

  private String buildStatusUpdateEmailHtml(String candidateName, String jobTitle, String status) {
    String statusColor = getStatusColor(status);
    String statusIcon = getStatusIcon(status);
    String statusText = getStatusText(status);
    String mainContent = getStatusMainContent(jobTitle, status);

    return String.format(
        """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: %s; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                    .status-badge { display: inline-block; padding: 10px 20px; background: %s; color: white; border-radius: 20px; font-weight: bold; margin: 20px 0; }
                    .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">%s %s</h1>
                    </div>
                    <div class="content">
                        <p>Kính gửi <strong>%s</strong>,</p>

                        <div class="info-box">
                            <p><strong>📋 Vị trí ứng tuyển:</strong> %s</p>
                            <p><strong>📊 Trạng thái:</strong> <span class="status-badge">%s</span></p>
                        </div>

                        %s

                        <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Tuyển dụng - Luật Poip</strong></p>
                    </div>
                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                        <p>© 2026 Luật Poip. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
        statusColor,
        statusColor,
        statusIcon,
        statusText,
        candidateName,
        jobTitle,
        statusText,
        mainContent);
  }

  private String getStatusColor(String status) {
    switch (status) {
      case "REVIEWING":
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      case "ACCEPTED":
        return "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
      case "REJECTED":
        return "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)";
      default:
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  }

  private String getStatusIcon(String status) {
    switch (status) {
      case "REVIEWING":
        return "🔍";
      case "ACCEPTED":
        return "🎉";
      case "REJECTED":
        return "📋";
      default:
        return "📬";
    }
  }

  private String getStatusText(String status) {
    switch (status) {
      case "REVIEWING":
        return "Đang Xem Xét";
      case "ACCEPTED":
        return "Chấp Nhận";
      case "REJECTED":
        return "Thông Báo Kết Quả";
      default:
        return "Cập Nhật";
    }
  }

  private String getStatusMainContent(String jobTitle, String status) {
    switch (status) {
      case "REVIEWING":
        return """
                    <p>Đơn ứng tuyển của bạn đang được đội ngũ tuyển dụng xem xét kỹ lưỡng.</p>
                    <p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể để thông báo kết quả hoặc sắp xếp buổi phỏng vấn.</p>
                    <p><em>Thời gian xử lý thường từ 3-5 ngày làm việc.</em></p>
                    """;

      case "ACCEPTED":
        return """
                    <p><strong>Chúc mừng!</strong> Đơn ứng tuyển của bạn đã được chấp nhận.</p>
                    <p>Chúng tôi rất vui mừng được chào đón bạn tham gia vào đội ngũ của Luật Poip.</p>
                    <p>Đội ngũ nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất để:</p>
                    <ul>
                        <li>Thông báo chi tiết về vị trí công việc</li>
                        <li>Hướng dẫn các bước tiếp theo</li>
                        <li>Sắp xếp ngày bắt đầu làm việc</li>
                    </ul>
                    """;

      case "REJECTED":
        return """
                    <p>Cảm ơn bạn đã dành thời gian ứng tuyển vào vị trí <strong>%s</strong> tại Luật Poip.</p>
                    <p>Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng chúng tôi quyết định không tiếp tục với đơn ứng tuyển của bạn lần này.</p>
                    <p>Quyết định này không phản ánh năng lực của bạn mà do chúng tôi đã tìm được ứng viên phù hợp hơn với yêu cầu cụ thể của vị trí này.</p>
                    <p>Chúng tôi đánh giá cao sự quan tâm của bạn và khuyến khích bạn tiếp tục theo dõi các cơ hội nghề nghiệp khác tại Luật Poip.</p>
                    <p><strong>Chúc bạn thành công trong sự nghiệp!</strong></p>
                    """
            .formatted(jobTitle);

      default:
        return "<p>Trạng thái đơn ứng tuyển của bạn đã được cập nhật.</p>";
    }
  }
}

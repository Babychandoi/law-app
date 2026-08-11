package org.law_app.backend.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Gửi email sau khi đăng ký đã COMMIT.
 *
 * <p>Trước đây email gọi trực tiếp trong phương thức @Transactional và lại chạy @Async, nên nó bay
 * ra ngoài transaction: khi insert lỗi (ví dụ ghi chú dài quá cột), transaction rollback nhưng thư
 * "đã nhận yêu cầu tư vấn" vẫn tới tay khách. Khách chờ được gọi lại trong khi hệ thống không có
 * bản ghi nào. AFTER_COMMIT đảm bảo chỉ gửi khi dữ liệu thật sự đã lưu.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerRegisteredEmailListener {

  private final EmailService emailService;

  @Value("${app.notification-email}")
  private String adminEmail;

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onCustomerRegistered(CustomerRegisteredEvent event) {
    String serviceName = escape(event.serviceName());
    String name =
        event.customerName() == null || event.customerName().isBlank()
            ? "Khách hàng"
            : escape(event.customerName());
    String phone = event.phone() == null ? "(không có)" : escape(event.phone());
    String note = event.note() == null ? "" : escape(event.note());
    String email = event.email();

    if (adminEmail != null && !adminEmail.isBlank()) {
      String subject = "[Đăng ký dịch vụ] " + event.serviceName() + " — " + event.customerName();
      String body =
          "<h2>Khách hàng mới đăng ký dịch vụ</h2>"
              + "<p><b>Dịch vụ:</b> "
              + serviceName
              + "</p>"
              + "<p><b>Họ tên:</b> "
              + name
              + "</p>"
              + "<p><b>Điện thoại:</b> "
              + phone
              + "</p>"
              + "<p><b>Email:</b> "
              + (email == null || email.isBlank() ? "(không có)" : escape(email))
              + "</p>"
              + "<p><b>Ghi chú:</b> "
              + note
              + "</p>";
      emailService.sendEmail(adminEmail, subject, body);
    }

    if (email != null && !email.isBlank()) {
      String subject = "Xác nhận đăng ký dịch vụ — Poip Legal";
      String body =
          "<p>Xin chào <b>"
              + name
              + "</b>,</p>"
              + "<p>Cảm ơn bạn đã đăng ký dịch vụ <b>"
              + serviceName
              + "</b> tại Poip Legal. "
              + "Chúng tôi đã nhận được yêu cầu và sẽ liên hệ với bạn trong thời gian sớm nhất.</p>"
              + "<p>Trân trọng,<br/>Đội ngũ Poip Legal</p>";
      emailService.sendEmail(email, subject, body);
    }
  }

  /**
   * Thoát ký tự HTML. Nội dung do khách nhập được ghép thẳng vào thân thư HTML, mà form công khai
   * thì bot spam nào cũng gửi được — không thoát là mở đường chèn thẻ, link giả vào hộp thư nội bộ.
   */
  private static String escape(String value) {
    if (value == null) return "";
    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }
}

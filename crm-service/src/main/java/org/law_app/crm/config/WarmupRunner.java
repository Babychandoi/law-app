package org.law_app.crm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.crm.repository.CareActionRepository;
import org.law_app.crm.repository.CareResultRepository;
import org.law_app.crm.repository.CareStatusRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.repository.TagRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * Chạy trước một lượt các truy vấn mà màn hình CRM dùng, ngay khi service khởi động.
 *
 * <p>Lý do: Hibernate, connection pool JDBC và các proxy của Spring Data đều khởi tạo LƯỜI — chỉ
 * dựng lên khi có request thật. Nên request ĐẦU TIÊN sau mỗi lần deploy phải trả toàn bộ chi phí
 * đó. Đo được trên production: cùng endpoint /crm/config/care-statuses (chỉ 6 dòng), request chưa
 * xác thực mất 33 ms còn request đầu tiên đã xác thực mất 2.045 ms. Nhân viên mở trang CRM ngay sau
 * khi deploy là người phải chờ.
 *
 * <p>Đẩy chi phí đó về lúc khởi động, nơi không ai ngồi đợi. Nuốt lỗi có chủ đích: đây chỉ là tối
 * ưu tốc độ, hỏng bước này không được phép chặn service khởi động.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.warmup.enabled", havingValue = "true", matchIfMissing = true)
public class WarmupRunner implements ApplicationRunner {

  private final CareStatusRepository careStatusRepository;
  private final CareActionRepository careActionRepository;
  private final CareResultRepository careResultRepository;
  private final TagRepository tagRepository;
  private final CrmCaseRepository crmCaseRepository;

  @Override
  public void run(ApplicationArguments args) {
    long startedAt = System.nanoTime();
    try {
      careStatusRepository.findAll();
      careActionRepository.findAll();
      careResultRepository.findAll();
      tagRepository.findAll();
      // Truy vấn phân trang dựng thêm phần đếm và ánh xạ entity — đúng đường mà /crm/cases đi.
      crmCaseRepository.findAll(PageRequest.of(0, 1));
      log.info("Làm ấm CRM xong sau {} ms", (System.nanoTime() - startedAt) / 1_000_000);
    } catch (Exception e) {
      log.warn("Làm ấm CRM thất bại (bỏ qua, không ảnh hưởng khởi động): {}", e.getMessage());
    }
  }
}

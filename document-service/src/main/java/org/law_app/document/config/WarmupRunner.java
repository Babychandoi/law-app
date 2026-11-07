package org.law_app.document.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.document.repository.DocumentBundleRepository;
import org.law_app.document.repository.DocumentClauseRepository;
import org.law_app.document.repository.DocumentFolderRepository;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * Chạy trước một lượt các truy vấn mà khu Tài liệu dùng, ngay khi service khởi động.
 *
 * <p>Cùng lý do với WarmupRunner của crm-service, nhưng ở đây nặng hơn nhiều: driver MongoDB phải
 * bắt tay, chọn server và dựng bộ ánh xạ tài liệu ở lần dùng đầu tiên. Đo trên production:
 * /documents/templates/page mất 9.957 ms ở lần gọi đầu, còn khoảng 380 ms ở các lần sau. Với
 * gatewayClient đặt timeout 20 giây, một lần khởi động nguội sâu là đủ để người dùng thấy timeout.
 *
 * <p>Nuốt lỗi có chủ đích: chỉ là tối ưu tốc độ, không được phép chặn service khởi động.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.warmup.enabled", havingValue = "true", matchIfMissing = true)
public class WarmupRunner implements ApplicationRunner {

  private final DocumentTemplateRepository templateRepository;
  private final DocumentFolderRepository folderRepository;
  private final DocumentBundleRepository bundleRepository;
  private final DocumentClauseRepository clauseRepository;
  private final GeneratedDocumentRepository generatedDocumentRepository;

  @Override
  public void run(ApplicationArguments args) {
    long startedAt = System.nanoTime();
    try {
      // Phân trang: đúng đường mà /documents/templates/page đi, gồm cả đếm tổng.
      templateRepository.findAll(PageRequest.of(0, 1));
      folderRepository.findAll();
      bundleRepository.count();
      clauseRepository.count();
      generatedDocumentRepository.findAll(PageRequest.of(0, 1));
      log.info("Làm ấm Tài liệu xong sau {} ms", (System.nanoTime() - startedAt) / 1_000_000);
    } catch (Exception e) {
      log.warn("Làm ấm Tài liệu thất bại (bỏ qua, không ảnh hưởng khởi động): {}", e.getMessage());
    }
  }
}

package org.law_app.crm.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.crm.domain.CareAction;
import org.law_app.crm.domain.CareResult;
import org.law_app.crm.domain.CareStatus;
import org.law_app.crm.repository.CareActionRepository;
import org.law_app.crm.repository.CareResultRepository;
import org.law_app.crm.repository.CareStatusRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;

/** Seeds a sensible default care workflow once, so the module is usable out of the box. */
@Slf4j
@Component
@RequiredArgsConstructor
public class CrmSeedRunner implements ApplicationRunner {

  private final CareStatusRepository statusRepo;
  private final CareActionRepository actionRepo;
  private final CareResultRepository resultRepo;

  @Override
  public void run(ApplicationArguments args) {
    if (statusRepo.count() == 0) {
      statusRepo.saveAll(
          List.of(
              status("Chưa chăm sóc", "NEW", "#9CA3AF", 1, true, false, false),
              status("Đã liên hệ", "CONTACTED", "#3B82F6", 2, false, false, false),
              status("Chờ khách phản hồi", "WAITING", "#F59E0B", 3, false, false, false),
              status("Hẹn chăm lại", "FOLLOW_UP", "#8B5CF6", 4, false, false, true),
              status("Đã xử lý", "DONE", "#10B981", 5, false, true, false),
              status("Không cần chăm tiếp", "CLOSED", "#6B7280", 6, false, true, false)));
      log.info("Seeded default care statuses");
    }
    if (actionRepo.count() == 0) {
      actionRepo.saveAll(
          List.of(
              action("Nhắn chat", "CHAT", 1),
              action("Gọi điện", "CALL", 2),
              action("Gửi tài liệu", "SEND_DOC", 3),
              action("Tư vấn dịch vụ", "CONSULT", 4),
              action("Hỗ trợ kỹ thuật", "SUPPORT", 5),
              action("Ghi chú nội bộ", "NOTE", 6)));
      log.info("Seeded default care actions");
    }
    if (resultRepo.count() == 0) {
      resultRepo.saveAll(
          List.of(
              result("Khách đã phản hồi", "RESPONDED", 1, false),
              result("Khách chưa phản hồi", "NO_RESPONSE", 2, false),
              result("Khách hẹn lại", "SCHEDULED", 3, true),
              result("Đã xử lý xong", "RESOLVED", 4, false),
              result("Không liên hệ được", "UNREACHABLE", 5, false),
              result("Không còn nhu cầu", "NOT_INTERESTED", 6, false)));
      log.info("Seeded default care results");
    }
  }

  private CareStatus status(
      String name,
      String code,
      String color,
      int order,
      boolean isDefault,
      boolean isClosed,
      boolean requireFollowUp) {
    return CareStatus.builder()
        .name(name)
        .code(code)
        .color(color)
        .sortOrder(order)
        .isDefault(isDefault)
        .isClosed(isClosed)
        .requireFollowUpDate(requireFollowUp)
        .active(true)
        .build();
  }

  private CareAction action(String name, String code, int order) {
    return CareAction.builder().name(name).code(code).sortOrder(order).active(true).build();
  }

  private CareResult result(String name, String code, int order, boolean requireFollowUp) {
    return CareResult.builder()
        .name(name)
        .code(code)
        .sortOrder(order)
        .requireFollowUpDate(requireFollowUp)
        .active(true)
        .build();
  }
}

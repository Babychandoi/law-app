package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CaseTag;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.repository.CareLogRepository;
import org.law_app.crm.repository.CaseTagRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CrmCaseServiceTest {

  @Mock private CrmCaseRepository caseRepository;
  @Mock private CaseTagRepository caseTagRepository;
  @Mock private CareLogRepository careLogRepository;

  @InjectMocks private CrmCaseService service;

  @Test
  void detailReturnsAnAuthorizedDocumentContextSnapshot() {
    Date createdAt = new Date(1_750_000_000_000L);
    Date updatedAt = new Date(1_750_000_100_000L);
    Instant syncedAt = Instant.parse("2026-07-29T03:00:00Z");
    CrmCase crmCase =
        CrmCase.builder()
            .id("case-1")
            .customerId("customer-1")
            .customerEmail("client@example.com")
            .customerPhone("0900000000")
            .serviceId("service-35")
            .serviceName("Đăng ký nhãn hiệu")
            .name("Công ty Ví dụ")
            .description("Hồ sơ nhóm 35")
            .status("PROCESSING")
            .assignedUserId("staff-1")
            .careStatusId(4L)
            .caseCreatedAt(createdAt)
            .caseUpdatedAt(updatedAt)
            .syncedAt(syncedAt)
            .build();
    when(caseRepository.findById("case-1")).thenReturn(Optional.of(crmCase));
    when(caseTagRepository.findByCaseId("case-1"))
        .thenReturn(
            List.of(
                CaseTag.builder().caseId("case-1").tagId(8L).build(),
                CaseTag.builder().caseId("case-1").tagId(13L).build()));

    var detail = service.detail("case-1");

    assertThat(detail.id()).isEqualTo("case-1");
    assertThat(detail.customerId()).isEqualTo("customer-1");
    assertThat(detail.serviceId()).isEqualTo("service-35");
    assertThat(detail.serviceName()).isEqualTo("Đăng ký nhãn hiệu");
    assertThat(detail.assignedUserId()).isEqualTo("staff-1");
    assertThat(detail.tagIds()).containsExactly(8L, 13L);
    assertThat(detail.caseCreatedAt()).isEqualTo(createdAt);
    assertThat(detail.syncedAt()).isEqualTo(syncedAt);
  }
}

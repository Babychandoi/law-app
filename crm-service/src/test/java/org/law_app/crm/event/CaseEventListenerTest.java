package org.law_app.crm.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.CrmLead;
import org.law_app.crm.domain.ProcessedCaseEvent;
import org.law_app.crm.repository.CareStatusRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.repository.CrmLeadRepository;
import org.law_app.crm.repository.ProcessedCaseEventRepository;
import org.law_app.crm.service.CrmLeadSyncService;
import org.law_app.crm.service.CrmSupport;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CaseEventListenerTest {

  @Mock private CrmCaseRepository caseRepository;
  @Mock private CareStatusRepository careStatusRepository;
  @Mock private ProcessedCaseEventRepository inboxRepository;
  @Mock private CrmLeadRepository leadRepository;

  @Test
  void skipsAnAlreadyProcessedDelivery() {
    when(inboxRepository.existsById("event-1")).thenReturn(true);
    CrmLeadSyncService leadSyncService = new CrmLeadSyncService(leadRepository);
    CaseEventListener listener =
        new CaseEventListener(
            caseRepository, careStatusRepository, inboxRepository, leadSyncService);
    CaseEvent event = new CaseEvent();
    event.setEventId("event-1");
    event.setCaseId("case-1");

    listener.onCaseEvent(event, "case.created");

    verify(caseRepository, never()).findById(any());
    verify(caseRepository, never()).save(any());
    verify(leadRepository, never()).save(any());
  }

  @Test
  void recordsButDoesNotApplyAnOutOfOrderEvent() {
    Date currentTimestamp = new Date(2_000_000L);
    CrmCase current =
        CrmCase.builder()
            .id("case-1")
            .status("PROCESSING")
            .serviceId("service-new")
            .caseUpdatedAt(currentTimestamp)
            .syncedAt(Instant.parse("2026-07-29T01:00:00Z"))
            .build();
    when(inboxRepository.existsById("event-old")).thenReturn(false);
    when(caseRepository.findById("case-1")).thenReturn(Optional.of(current));
    when(leadRepository.existsBySourceCaseId("case-1")).thenReturn(true);
    CrmLeadSyncService leadSyncService = new CrmLeadSyncService(leadRepository);
    CaseEventListener listener =
        new CaseEventListener(
            caseRepository, careStatusRepository, inboxRepository, leadSyncService);
    CaseEvent event = new CaseEvent();
    event.setEventId("event-old");
    event.setCaseId("case-1");
    event.setStatus("NEW");
    event.setServiceId("service-old");
    event.setUpdatedAt(new Date(1_000_000L));

    listener.onCaseEvent(event, "case.statusChanged");

    ArgumentCaptor<CrmCase> saved = ArgumentCaptor.forClass(CrmCase.class);
    verify(caseRepository).save(saved.capture());
    assertThat(saved.getValue().getStatus()).isEqualTo("PROCESSING");
    assertThat(saved.getValue().getServiceId()).isEqualTo("service-new");
    verify(inboxRepository).save(any(ProcessedCaseEvent.class));
    verify(leadRepository, never()).save(any());
  }

  @Test
  void createsWebsiteCrmLeadIdempotentlyWhenNewCaseEventArrives() {
    when(inboxRepository.existsById("event-new")).thenReturn(false);
    when(caseRepository.findById("case-web-1")).thenReturn(Optional.empty());
    when(leadRepository.existsBySourceCaseId("case-web-1")).thenReturn(false);
    when(leadRepository.findTopByCodeStartingWithOrderByCodeDesc("TN"))
        .thenReturn(Optional.empty());
    when(leadRepository.existsByCode("TN000001")).thenReturn(false);
    when(leadRepository.save(any(CrmLead.class))).thenAnswer(inv -> inv.getArgument(0));

    CrmLeadSyncService leadSyncService = new CrmLeadSyncService(leadRepository);
    CaseEventListener listener =
        new CaseEventListener(
            caseRepository, careStatusRepository, inboxRepository, leadSyncService);

    CaseEvent event = new CaseEvent();
    event.setEventId("event-new");
    event.setCaseId("case-web-1");
    event.setName("Nguyễn Thị Mai");
    event.setCustomerPhone("0909888777");
    event.setCustomerEmail("mai.nt@example.vn");
    event.setServiceName("Đăng ký nhãn hiệu");
    event.setDescription("Tư vấn đăng ký nhãn hiệu nhóm 35");
    event.setCreatedAt(new Date(1_760_000_000_000L));

    listener.onCaseEvent(event, "case.created");

    ArgumentCaptor<CrmLead> leadCaptor = ArgumentCaptor.forClass(CrmLead.class);
    verify(leadRepository).save(leadCaptor.capture());
    CrmLead created = leadCaptor.getValue();
    assertThat(created.getCode()).isEqualTo("TN000001");
    assertThat(created.getSourceCaseId()).isEqualTo("case-web-1");
    assertThat(created.getCustomerName()).isEqualTo("Nguyễn Thị Mai");
    assertThat(created.getFullName()).isEqualTo("Nguyễn Thị Mai");
    assertThat(created.getPhone()).isEqualTo("0909888777");
    assertThat(created.getPersonalEmail()).isEqualTo("mai.nt@example.vn");
    assertThat(CrmSupport.fromJsonList(created.getServiceGroups()))
        .isEqualTo(List.of("Sở hữu trí tuệ", "Đăng ký nhãn hiệu"));
    assertThat(created.getDemandDetail()).isEqualTo("Tư vấn đăng ký nhãn hiệu nhóm 35");
    assertThat(created.getLeadSource()).isEqualTo("6/ Website");
    assertThat(created.getCustomerStatus()).isEqualTo("3/ Tiềm năng");
    assertThat(created.getGender()).isNull();
  }

  @Test
  void backfillClearsLegacyDefaultGenderAndNormalizesBracketedDemandOnlyForUntouchedSystemLeads() {
    CrmCase c1 =
        CrmCase.builder()
            .id("case-sys")
            .name("Đỗ Quốc Phong")
            .serviceName("Bảo hộ kiểu dáng công nghiệp")
            .build();
    CrmCase c2 = CrmCase.builder().id("case-human").name("Trần Thị Hà").build();

    CrmLead sysLead =
        CrmLead.builder()
            .id("lead-sys")
            .code("TN000001")
            .sourceCaseId("case-sys")
            .demandDetail(
                "[Nguồn: LP-tong-dich-vu-ads] [Đối tượng: Cá nhân] "
                    + "[Dịch vụ: Bảo hộ kiểu dáng công nghiệp] Kiếm tiền "
                    + "[Chiến dịch: utm_source=facebook; utm_medium=paid_social; "
                    + "utm_campaign=poip_nhan_hieu_toan_quoc]")
            .leadSource("6/ Website")
            .gender("Nữ")
            .createdBy("system")
            .updatedBy("system")
            .build();
    CrmLead editedLead =
        CrmLead.builder()
            .id("lead-human")
            .code("TN000002")
            .sourceCaseId("case-human")
            .gender("Nữ")
            .createdBy("system")
            .updatedBy("staff-1")
            .build();

    when(leadRepository.findBySourceCaseId("case-sys")).thenReturn(Optional.of(sysLead));
    when(leadRepository.findBySourceCaseId("case-human")).thenReturn(Optional.of(editedLead));

    CrmLeadSyncService leadSyncService = new CrmLeadSyncService(leadRepository);
    int inserted = leadSyncService.backfillFromCases(List.of(c1, c2));

    assertThat(inserted).isZero();
    assertThat(sysLead.getGender()).isNull();
    assertThat(sysLead.getLeadSource()).isEqualTo("1/ Quảng cáo");
    assertThat(sysLead.getDemandDetail()).startsWith("Nội dung KH: Kiếm tiền");
    assertThat(CrmSupport.fromJsonList(sysLead.getTags()))
        .containsExactly("Facebook Ads", "Cá nhân");
    assertThat(editedLead.getGender()).isEqualTo("Nữ");
    verify(leadRepository).save(sysLead);
    verify(leadRepository, never()).save(editedLead);
  }
}

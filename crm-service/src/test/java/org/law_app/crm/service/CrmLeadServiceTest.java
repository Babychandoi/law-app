package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmAccountContact;
import org.law_app.crm.domain.CrmActivity;
import org.law_app.crm.domain.CrmLead;
import org.law_app.crm.domain.CrmOpportunity;
import org.law_app.crm.repository.CrmAccountContactRepository;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmActivityRepository;
import org.law_app.crm.repository.CrmLeadRepository;
import org.law_app.crm.repository.CrmOpportunityItemRepository;
import org.law_app.crm.repository.CrmOpportunityRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.ActivityCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLeadDto;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertResponse;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadUpsertRequest;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CrmLeadServiceTest {

  @Mock private CrmLeadRepository leadRepository;
  @Mock private CrmAccountRepository accountRepository;
  @Mock private CrmAccountContactRepository contactRepository;
  @Mock private CrmOpportunityRepository opportunityRepository;
  @Mock private CrmOpportunityItemRepository opportunityItemRepository;
  @Mock private CrmContractService contractService;
  @Mock private CrmActivityRepository activityRepository;

  private CrmLeadService leadService;
  private CrmActivityService activityService;

  @BeforeEach
  void setUp() {
    CrmOpportunityService opportunityService =
        new CrmOpportunityService(
            opportunityRepository, opportunityItemRepository, accountRepository, contractService);
    CrmAccountService accountService =
        new CrmAccountService(
            accountRepository, contactRepository, opportunityService, contractService);
    leadService = new CrmLeadService(leadRepository, accountService, opportunityService);
    activityService = new CrmActivityRepositoryBackedServiceFactory().create();
  }

  private class CrmActivityRepositoryBackedServiceFactory {
    CrmActivityService create() {
      return new CrmActivityService(activityRepository, leadRepository);
    }
  }

  @Test
  void createGeneratesSequentialCodeAndSyncsFullNameWithDefaults() {
    when(leadRepository.findTopByCodeStartingWithOrderByCodeDesc("TN"))
        .thenReturn(Optional.of(CrmLead.builder().code("TN000004").build()));
    when(leadRepository.existsByCode("TN000005")).thenReturn(false);
    when(leadRepository.save(any(CrmLead.class))).thenAnswer(inv -> inv.getArgument(0));

    LeadUpsertRequest req =
        new LeadUpsertRequest(
            null,
            null,
            List.of("Nhãn hiệu"),
            "Trần Minh Khôi",
            null,
            "0901234567",
            "0315556667",
            "khoi@example.com",
            null,
            List.of("Sở hữu trí tuệ"),
            "Giám đốc",
            "staff-1",
            "Nguyễn Hà",
            null,
            null,
            "6/ Website",
            null,
            "Đăng ký nhãn hiệu độc quyền",
            "Công ty TNHH Khôi Nguyên",
            null,
            null,
            null,
            null,
            null,
            null,
            "TP. Hồ Chí Minh",
            "Quận 1",
            "12 Nguyễn Huệ",
            true,
            "Phòng SHTT",
            null);

    CrmLeadDto dto = leadService.create(req);

    assertThat(dto.code()).isEqualTo("TN000005");
    assertThat(dto.customerName()).isEqualTo("Trần Minh Khôi");
    assertThat(dto.fullName()).isEqualTo("Trần Minh Khôi");
    assertThat(dto.gender()).isNull();
    assertThat(dto.country()).isEqualTo("Việt Nam");
    assertThat(dto.customerStatus()).isEqualTo("3/ Tiềm năng");
    assertThat(dto.ownerUserId()).isEqualTo("staff-1");
    assertThat(dto.serviceGroups()).containsExactly("Sở hữu trí tuệ");
  }

  @Test
  void convertLeadCreatesAccountPrimaryContactAndOpportunity() {
    CrmLead existingLead =
        CrmLead.builder()
            .id("lead-1")
            .code("TN000001")
            .customerName("Lê Thu Thảo")
            .fullName("Lê Thu Thảo")
            .organizationName("Công ty TNHH Gokids Việt Nam")
            .phone("0903888999")
            .taxCode("0316894512")
            .workEmail("thao@gokids.vn")
            .jobTitle("Tổng Giám đốc")
            .serviceGroups("[\"Sở hữu trí tuệ\"]")
            .tags("[\"VIP\"]")
            .leadSource("6/ Website")
            .customerStatus("3/ Tiềm năng")
            .demandDetail("Đăng ký 2 nhóm nhãn hiệu Gokids")
            .province("TP. Hồ Chí Minh")
            .district("Quận 7")
            .address("45 Nguyễn Lương Bằng")
            .assignedUserId("staff-2")
            .assignedUserName("Trần Thị Thu Hà")
            .birthDate(LocalDate.of(1990, 5, 10))
            .shared(true)
            .build();

    when(leadRepository.findById("lead-1")).thenReturn(Optional.of(existingLead));
    when(leadRepository.save(any(CrmLead.class))).thenAnswer(inv -> inv.getArgument(0));
    when(accountRepository.findTopByCodeStartingWithOrderByCodeDesc("KH26"))
        .thenReturn(Optional.empty());
    when(accountRepository.existsByCode("KH260001")).thenReturn(false);
    when(accountRepository.save(any(CrmAccount.class))).thenAnswer(inv -> inv.getArgument(0));
    when(contactRepository.save(any(CrmAccountContact.class)))
        .thenAnswer(inv -> inv.getArgument(0));
    when(opportunityRepository.findTopByCodeStartingWithOrderByCodeDesc("CH26"))
        .thenReturn(Optional.empty());
    when(opportunityRepository.existsByCode("CH260001")).thenReturn(false);
    when(opportunityRepository.save(any(CrmOpportunity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    LeadConvertResponse res =
        leadService.convert(
            "lead-1",
            new LeadConvertRequest(
                true,
                "Đăng ký nhãn hiệu Gokids",
                new BigDecimal("5240000"),
                "2/ Gửi yêu cầu về hồ sơ"));

    assertThat(res.leadId()).isEqualTo("lead-1");
    assertThat(res.accountId()).isNotBlank();
    assertThat(res.opportunityId()).isNotBlank();

    ArgumentCaptor<CrmAccount> accCaptor = ArgumentCaptor.forClass(CrmAccount.class);
    verify(accountRepository).save(accCaptor.capture());
    assertThat(accCaptor.getValue().getCode()).isEqualTo("KH260001");
    assertThat(accCaptor.getValue().getCustomerName()).isEqualTo("Công ty TNHH Gokids Việt Nam");
    assertThat(accCaptor.getValue().getSourceLeadId()).isEqualTo("lead-1");
    assertThat(accCaptor.getValue().getCustomerStatus()).isEqualTo("Tiềm năng");

    ArgumentCaptor<CrmAccountContact> contactCaptor =
        ArgumentCaptor.forClass(CrmAccountContact.class);
    verify(contactRepository).save(contactCaptor.capture());
    assertThat(contactCaptor.getValue().isPrimaryContact()).isTrue();
    assertThat(contactCaptor.getValue().getFullName()).isEqualTo("Lê Thu Thảo");

    ArgumentCaptor<CrmOpportunity> oppCaptor = ArgumentCaptor.forClass(CrmOpportunity.class);
    verify(opportunityRepository).save(oppCaptor.capture());
    assertThat(oppCaptor.getValue().getCode()).isEqualTo("CH260001");
    assertThat(oppCaptor.getValue().getAccountId()).isEqualTo(res.accountId());
    assertThat(oppCaptor.getValue().getExpectedRevenue())
        .isEqualByComparingTo(new BigDecimal("5240000"));
    assertThat(oppCaptor.getValue().getStage()).isEqualTo("2/ Gửi yêu cầu về hồ sơ");

    assertThat(existingLead.getCustomerStatus()).isEqualTo("1/ Chốt hợp đồng");
    assertThat(existingLead.getConvertedAccountId()).isEqualTo(res.accountId());
    assertThat(existingLead.getConvertedOpportunityId()).isEqualTo(res.opportunityId());
    assertThat(existingLead.getConvertedAt()).isNotNull();
  }

  @Test
  void creatingLeadActivityUpdatesLeadLastInteractedAt() {
    CrmLead lead = CrmLead.builder().id("lead-99").code("TN000099").build();
    when(leadRepository.findById("lead-99")).thenReturn(Optional.of(lead));
    when(activityRepository.save(any(CrmActivity.class))).thenAnswer(inv -> inv.getArgument(0));

    activityService.create(
        new ActivityCreateRequest(
            "LEAD",
            "lead-99",
            "CALL",
            "Gọi điện tư vấn",
            "Khách quan tâm đăng ký nhãn hiệu",
            Instant.now(),
            true,
            "Trần Hà"));

    assertThat(lead.getLastInteractedAt()).isNotNull();
    verify(leadRepository).save(lead);
  }

  @Test
  void softDeleteRestorePermanentDeleteAndBulkActionsWorkOnLeadsAndAccounts() {
    CrmLead lead =
        CrmLead.builder().id("lead-del").code("TN000010").tags("[\"Nhãn hiệu\"]").build();
    when(leadRepository.findById("lead-del")).thenReturn(Optional.of(lead));
    when(leadRepository.save(any(CrmLead.class))).thenAnswer(inv -> inv.getArgument(0));

    leadService.delete("lead-del");
    assertThat(lead.isDeleted()).isTrue();
    assertThat(lead.getDeletedAt()).isNotNull();

    CrmLeadDto restored = leadService.restore("lead-del");
    assertThat(restored.deleted()).isFalse();
    assertThat(restored.deletedAt()).isNull();

    when(leadRepository.findAllById(List.of("lead-del"))).thenReturn(List.of(lead));
    int affected =
        leadService.bulkAction(
            new org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest(
                List.of("lead-del"), "DELETE", null, null, null, null));
    assertThat(affected).isEqualTo(1);
    assertThat(lead.isDeleted()).isTrue();

    leadService.permanentDelete("lead-del");
    verify(leadRepository).delete(lead);
  }
}

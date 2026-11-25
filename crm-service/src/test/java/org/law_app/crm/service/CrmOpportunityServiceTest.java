package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmOpportunity;
import org.law_app.crm.domain.CrmOpportunityItem;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmOpportunityItemRepository;
import org.law_app.crm.repository.CrmOpportunityRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmKanbanColumnDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityUpsertRequest;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class CrmOpportunityServiceTest {

  @Mock private CrmOpportunityRepository opportunityRepository;
  @Mock private CrmOpportunityItemRepository itemRepository;
  @Mock private CrmAccountRepository accountRepository;
  @Mock private CrmContractService contractService;

  @InjectMocks private CrmOpportunityService opportunityService;

  @Test
  void computesLineItemVatAndDiscountMathAndSyncsExpectedRevenue() {
    when(opportunityRepository.findTopByCodeStartingWithOrderByCodeDesc("CH26"))
        .thenReturn(Optional.empty());
    when(opportunityRepository.existsByCode("CH260001")).thenReturn(false);
    when(itemRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    when(opportunityRepository.save(any(CrmOpportunity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    // Item 1: 2 * 2,400,000 = 4,800,000; 10% discount = 480,000 -> taxable 4,320,000; 5% VAT =
    // 216,000 -> total 4,536,000
    // Item 2: 2 * 100,000 = 200,000; KCT VAT = 0 -> total 200,000
    // Expected sum = 4,736,000
    CrmLineItemDto item1 =
        new CrmLineItemDto(
            null,
            1,
            "SHTT-NH",
            "Đăng ký nhãn hiệu",
            null,
            "Nhãn/nhóm",
            new BigDecimal("2"),
            BigDecimal.ZERO,
            new BigDecimal("2400000"),
            null,
            BigDecimal.ZERO,
            new BigDecimal("10"),
            null,
            "5%",
            null,
            null,
            null,
            null,
            false);
    CrmLineItemDto item2 =
        new CrmLineItemDto(
            null,
            2,
            "PL-PNN",
            "Phụ lục_Phí NN",
            null,
            "Hồ sơ",
            new BigDecimal("2"),
            BigDecimal.ZERO,
            new BigDecimal("100000"),
            null,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            "KCT",
            null,
            null,
            null,
            null,
            false);

    CrmOpportunityDto created =
        opportunityService.create(
            new OpportunityUpsertRequest(
                null,
                List.of("SHTT"),
                "Đăng ký 2 nhóm nhãn hiệu",
                null,
                "Công ty TNHH Sao Khuê",
                "Hoàng Đức",
                "0912345678",
                null,
                null,
                LocalDate.now().plusDays(10),
                List.of("Khách mới"),
                List.of("Sở hữu trí tuệ"),
                "6/ Website",
                "staff-1",
                "Trần Hà",
                true,
                null,
                null,
                null,
                List.of(item1, item2)));

    assertThat(created.code()).isEqualTo("CH260001");
    assertThat(created.stage()).isEqualTo("1/ Liên hệ tư vấn & báo phí");
    assertThat(created.expectedRevenue()).isEqualByComparingTo(new BigDecimal("4736000"));
    assertThat(created.items()).hasSize(2);
    assertThat(created.items().get(0).amount()).isEqualByComparingTo(new BigDecimal("4800000"));
    assertThat(created.items().get(0).discountAmount())
        .isEqualByComparingTo(new BigDecimal("480000"));
    assertThat(created.items().get(0).vatAmount()).isEqualByComparingTo(new BigDecimal("216000"));
    assertThat(created.items().get(0).totalAmount())
        .isEqualByComparingTo(new BigDecimal("4536000"));
    assertThat(created.items().get(1).vatAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(created.items().get(1).totalAmount()).isEqualByComparingTo(new BigDecimal("200000"));
  }

  @Test
  void kanbanReturnsAllSevenCanonicalStagesInExactOrderWithTotals() {
    CrmOpportunity o1 =
        CrmOpportunity.builder()
            .id("o1")
            .code("CH260001")
            .opportunityName("Opp 1")
            .stage("1/ Liên hệ tư vấn & báo phí")
            .expectedRevenue(new BigDecimal("2500000"))
            .build();
    CrmOpportunity o2 =
        CrmOpportunity.builder()
            .id("o2")
            .code("CH260002")
            .opportunityName("Opp 2")
            .stage("1/ Liên hệ tư vấn & báo phí")
            .expectedRevenue(new BigDecimal("3500000"))
            .build();
    CrmOpportunity o3 =
        CrmOpportunity.builder()
            .id("o3")
            .code("CH260003")
            .opportunityName("Opp 3")
            .stage("6/ Gửi HĐ dự thảo cho KH")
            .expectedRevenue(new BigDecimal("7800000"))
            .build();

    when(opportunityRepository.findAll(any(Specification.class), any(Sort.class)))
        .thenReturn(List.of(o1, o2, o3));
    when(itemRepository.findByOpportunityIdInOrderBySortOrderAsc(List.of("o1", "o2", "o3")))
        .thenReturn(List.of());

    List<CrmKanbanColumnDto> columns = opportunityService.kanban("me", null, null, null);

    assertThat(columns).hasSize(7);
    assertThat(columns)
        .extracting(CrmKanbanColumnDto::stage)
        .containsExactlyElementsOf(CrmOpportunityService.CANONICAL_STAGES);
    assertThat(columns.get(0).count()).isEqualTo(2);
    assertThat(columns.get(0).totalExpectedRevenue())
        .isEqualByComparingTo(new BigDecimal("6000000"));
    assertThat(columns.get(5).count()).isEqualTo(1);
    assertThat(columns.get(5).totalExpectedRevenue())
        .isEqualByComparingTo(new BigDecimal("7800000"));
    assertThat(columns.get(6).count()).isZero();
    assertThat(columns.get(6).totalExpectedRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  void convertToContractCreatesDraftContractAndStoresConvertedContractId() {
    CrmOpportunity opp =
        CrmOpportunity.builder()
            .id("opp-1")
            .code("CH260010")
            .opportunityName("Đăng ký bản quyền Gokids")
            .accountId("acc-1")
            .accountName("Công ty TNHH Gokids Việt Nam")
            .contactName("Trần Quốc Tuấn")
            .expectedRevenue(new BigDecimal("2620000"))
            .stage("7/ KH thanh toán lần 1")
            .leadSource("6/ Website")
            .assignedUserId("staff-1")
            .assignedUserName("Trần Hà")
            .build();
    CrmOpportunityItem oppItem =
        CrmOpportunityItem.builder()
            .id("oi-1")
            .opportunityId("opp-1")
            .sortOrder(1)
            .itemCode("SHTT-BQ")
            .description("Bản quyền tác giả")
            .unit("Tác phẩm")
            .quantity(BigDecimal.ONE)
            .unitPrice(new BigDecimal("2400000"))
            .amount(new BigDecimal("2400000"))
            .vatRate("5%")
            .vatAmount(new BigDecimal("120000"))
            .totalAmount(new BigDecimal("2520000"))
            .build();
    CrmAccount account =
        CrmAccount.builder()
            .id("acc-1")
            .code("KH260001")
            .customerName("Công ty TNHH Gokids Việt Nam")
            .taxCode("0316894512")
            .build();

    when(opportunityRepository.findById("opp-1")).thenReturn(Optional.of(opp));
    when(itemRepository.findByOpportunityIdOrderBySortOrderAsc("opp-1"))
        .thenReturn(List.of(oppItem));
    when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));
    when(opportunityRepository.save(any(CrmOpportunity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    CrmContractDto fakeContract =
        new CrmContractDto(
            "contract-99",
            "PD261077",
            "acc-1",
            "KH260001",
            "Công ty TNHH Gokids Việt Nam",
            "Trần Quốc Tuấn",
            "opp-1",
            null,
            "Bản quyền tác giả",
            LocalDate.now(),
            null,
            null,
            null,
            LocalDate.now(),
            null,
            "Bản nháp",
            "Chưa thực hiện",
            "Chưa có",
            "6/ Website",
            "Chuyển đổi từ Cơ hội",
            null,
            "staff-1",
            "Trần Hà",
            null,
            null,
            BigDecimal.ZERO,
            new BigDecimal("2520000"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            new BigDecimal("2520000"),
            BigDecimal.ZERO,
            new BigDecimal("2520000"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            null,
            null,
            null,
            null,
            "Việt Nam",
            null,
            null,
            null,
            "0316894512",
            false,
            null,
            false,
            null,
            List.of(),
            "system",
            "system",
            null,
            null);

    when(contractService.create(any(ContractUpsertRequest.class))).thenReturn(fakeContract);

    CrmContractDto result = opportunityService.convertToContract("opp-1");

    assertThat(result.id()).isEqualTo("contract-99");
    assertThat(opp.getConvertedContractId()).isEqualTo("contract-99");

    ArgumentCaptor<ContractUpsertRequest> reqCaptor =
        ArgumentCaptor.forClass(ContractUpsertRequest.class);
    verify(contractService).create(reqCaptor.capture());
    assertThat(reqCaptor.getValue().executionStatus()).isEqualTo("Chưa thực hiện");
    assertThat(reqCaptor.getValue().revenueStatus()).isEqualTo("Bản nháp");
    assertThat(reqCaptor.getValue().bookingDate()).isNotNull();
    assertThat(reqCaptor.getValue().items()).hasSize(1);
  }
}

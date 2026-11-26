package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmContract;
import org.law_app.crm.domain.CrmContractCashflow;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmContractCashflowRepository;
import org.law_app.crm.repository.CrmContractItemRepository;
import org.law_app.crm.repository.CrmContractRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.CashflowCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.law_app.crm.web.EnterpriseCrmDtos.ServiceCatalogItem;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class CrmContractServiceTest {

  @Mock private CrmContractRepository contractRepository;
  @Mock private CrmContractItemRepository itemRepository;
  @Mock private CrmContractCashflowRepository cashflowRepository;
  @Mock private CrmAccountRepository accountRepository;

  @InjectMocks private CrmContractService contractService;

  @Test
  void catalogContainsTwelvePoipLegalServices() {
    CrmCatalogService catalogService = new CrmCatalogService();
    List<ServiceCatalogItem> items = catalogService.listServices();
    assertThat(items).hasSize(12);
    assertThat(items)
        .extracting(ServiceCatalogItem::code)
        .contains("SHTT-NH", "SHTT-BQ", "PL-PNN", "DN-DKKD", "DN-TNDN", "GP-WEB");
  }

  @Test
  void createAutoGeneratesPd261076AndComputesOrderValueAndGoodsSummary() {
    when(contractRepository.findTopByContractNumberStartingWithOrderByContractNumberDesc("PD26"))
        .thenReturn(Optional.empty());
    when(contractRepository.existsByContractNumber("PD261076")).thenReturn(false);
    when(itemRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    when(contractRepository.save(any(CrmContract.class))).thenAnswer(inv -> inv.getArgument(0));

    // Item 1: 1 * 2,400,000 + 5% VAT (120,000) = 2,520,000
    // Item 2: 1 * 100,000 + KCT VAT (0) = 100,000
    // Total orderValue = 2,620,000
    CrmLineItemDto i1 =
        new CrmLineItemDto(
            null,
            1,
            "SHTT-BQ",
            "Bản quyền tác giả",
            null,
            "Tác phẩm",
            BigDecimal.ONE,
            BigDecimal.ZERO,
            new BigDecimal("2400000"),
            null,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            "5%",
            null,
            null,
            null,
            null,
            false);
    CrmLineItemDto i2 =
        new CrmLineItemDto(
            null,
            2,
            "PL-PNN",
            "Phụ lục_Phí NN",
            null,
            "Hồ sơ",
            BigDecimal.ONE,
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

    ContractUpsertRequest req =
        new ContractUpsertRequest(
            null,
            null,
            "KH260002",
            "Công ty TNHH Đỗ Mạnh Cường Studios",
            "Phạm Huy Cận",
            null,
            null,
            null,
            LocalDate.of(2026, 11, 20),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "4/ Khách cũ giới thiệu",
            null,
            null,
            "staff-1",
            "Nguyễn Văn Minh",
            "Phòng SHTT",
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal("300000"),
            new BigDecimal("400000"),
            BigDecimal.ZERO,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "0315428976",
            true,
            null,
            false,
            true,
            null,
            List.of(i1, i2),
            List.of("SHTT"));

    CrmContractDto dto = contractService.create(req);

    assertThat(dto.contractNumber()).isEqualTo("PD261076");
    assertThat(dto.revenueStatus()).isEqualTo("Bản nháp");
    assertThat(dto.executionStatus()).isEqualTo("Chưa thực hiện");
    assertThat(dto.archivedStatus()).isEqualTo("Chưa có");
    assertThat(dto.goodsSummary()).isEqualTo("Bản quyền tác giả, Phụ lục_Phí NN");
    assertThat(dto.orderValue()).isEqualByComparingTo(new BigDecimal("2620000"));
    assertThat(dto.plannedExpense()).isEqualByComparingTo(new BigDecimal("700000"));
    assertThat(dto.receivableAmount()).isEqualByComparingTo(new BigDecimal("2620000"));
    assertThat(dto.payableAmount()).isEqualByComparingTo(new BigDecimal("700000"));
    assertThat(dto.estimatedProfit()).isEqualByComparingTo(new BigDecimal("1920000"));
  }

  @Test
  void cashflowLedgerRecalculatesCollectedPlannedActualReceivablePayableAndProfit() {
    CrmContract contract =
        CrmContract.builder()
            .id("c-1")
            .contractNumber("PD261076")
            .orderValue(new BigDecimal("10000000"))
            .collectedAmount(BigDecimal.ZERO)
            .plannedExpense(BigDecimal.ZERO)
            .actualExpense(BigDecimal.ZERO)
            .receivableAmount(new BigDecimal("10000000"))
            .payableAmount(BigDecimal.ZERO)
            .estimatedProfit(new BigDecimal("10000000"))
            .build();

    List<CrmContractCashflow> ledger = new ArrayList<>();
    when(contractRepository.findById("c-1")).thenReturn(Optional.of(contract));
    when(contractRepository.save(any(CrmContract.class))).thenAnswer(inv -> inv.getArgument(0));
    when(cashflowRepository.save(any(CrmContractCashflow.class)))
        .thenAnswer(
            inv -> {
              CrmContractCashflow cf = inv.getArgument(0);
              ledger.add(cf);
              return cf;
            });
    when(cashflowRepository.findByContractIdOrderByTransactionDateDescCreatedAtDesc("c-1"))
        .thenAnswer(inv -> List.copyOf(ledger));

    LocalDate payDate = LocalDate.of(2026, 11, 24);
    var thu1 =
        contractService.addCashflow(
            "c-1",
            new CashflowCreateRequest(
                "THUC_THU",
                "Đợt 1",
                "Thu đợt 1",
                null,
                new BigDecimal("6000000"),
                payDate,
                "Chuyển khoản",
                "VCB-01",
                "Đã xác nhận"));

    assertThat(contract.getCollectedAmount()).isEqualByComparingTo(new BigDecimal("6000000"));
    assertThat(contract.getReceivableAmount()).isEqualByComparingTo(new BigDecimal("4000000"));
    assertThat(contract.getPaymentDate()).isEqualTo(payDate);

    contractService.addCashflow(
        "c-1",
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Phí NN",
            "Dự kiến phí Cục SHTT",
            null,
            new BigDecimal("2500000"),
            payDate,
            "Chuyển khoản",
            "DK-01",
            "Đã duyệt"));
    contractService.addCashflow(
        "c-1",
        new CashflowCreateRequest(
            "THUC_CHI",
            "Phí NN",
            "Chi đợt 1",
            null,
            new BigDecimal("1500000"),
            payDate,
            "Chuyển khoản",
            "TC-01",
            "Đã xác nhận"));

    assertThat(contract.getPlannedExpense()).isEqualByComparingTo(new BigDecimal("2500000"));
    assertThat(contract.getActualExpense()).isEqualByComparingTo(new BigDecimal("1500000"));
    assertThat(contract.getPayableAmount()).isEqualByComparingTo(new BigDecimal("1000000"));
    // costBasis = max(actual 1.5M, planned 2.5M) = 2.5M -> profit = 10M - 2.5M = 7.5M
    assertThat(contract.getEstimatedProfit()).isEqualByComparingTo(new BigDecimal("7500000"));

    // Deleting the THUC_THU row resets collectedAmount to 0 and receivable back to 10M
    when(cashflowRepository.findById(thu1.id()))
        .thenAnswer(inv -> ledger.stream().filter(x -> x.getId().equals(thu1.id())).findFirst());
    contractService.deleteCashflow("c-1", thu1.id());
    ledger.removeIf(x -> x.getId().equals(thu1.id()));

    verify(cashflowRepository).delete(any(CrmContractCashflow.class));
    assertThat(contract.getCollectedAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(contract.getReceivableAmount()).isEqualByComparingTo(new BigDecimal("10000000"));
  }

  @Test
  void searchComputesSummaryKpisOverAllMatchingRecordsBeyondCurrentPage() {
    CrmContract c1 =
        CrmContract.builder()
            .id("c1")
            .contractNumber("PD261071")
            .orderValue(new BigDecimal("5000000"))
            .collectedAmount(new BigDecimal("5000000"))
            .receivableAmount(BigDecimal.ZERO)
            .estimatedProfit(new BigDecimal("3500000"))
            .actualExpense(new BigDecimal("1200000"))
            .plannedExpense(new BigDecimal("1500000"))
            .payableAmount(new BigDecimal("300000"))
            .serviceExpense(new BigDecimal("500000"))
            .stateFeeExpense(new BigDecimal("800000"))
            .supportExpense(new BigDecimal("200000"))
            .liquidationValue(new BigDecimal("5000000"))
            .uninvoicedAmount(new BigDecimal("1000000"))
            .build();
    CrmContract c2 =
        CrmContract.builder()
            .id("c2")
            .contractNumber("PD261072")
            .orderValue(new BigDecimal("8000000"))
            .collectedAmount(new BigDecimal("3000000"))
            .receivableAmount(new BigDecimal("5000000"))
            .estimatedProfit(new BigDecimal("6000000"))
            .actualExpense(new BigDecimal("1500000"))
            .plannedExpense(new BigDecimal("2000000"))
            .payableAmount(new BigDecimal("500000"))
            .serviceExpense(new BigDecimal("600000"))
            .stateFeeExpense(new BigDecimal("1000000"))
            .supportExpense(new BigDecimal("400000"))
            .liquidationValue(BigDecimal.ZERO)
            .uninvoicedAmount(new BigDecimal("2500000"))
            .build();

    var pageable = PageRequest.of(0, 1);
    when(contractRepository.findAll(any(Specification.class), eq(pageable)))
        .thenReturn(new PageImpl<>(List.of(c1), pageable, 2));
    when(contractRepository.findAll(any(Specification.class))).thenReturn(List.of(c1, c2));
    when(itemRepository.findByContractIdInOrderBySortOrderAsc(List.of("c1"))).thenReturn(List.of());

    var result =
        contractService.search(
            "me",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "[{\"field\":\"orderValue\",\"op\":\"GT\",\"value\":\"1000000\"}]",
            false,
            pageable);

    assertThat(result.payload().rows()).hasSize(1);
    var summary = result.payload().summary();
    assertThat(summary.totalRecords()).isEqualTo(2L);
    assertThat(summary.totalOrderValue()).isEqualByComparingTo(new BigDecimal("13000000"));
    assertThat(summary.totalCollected()).isEqualByComparingTo(new BigDecimal("8000000"));
    assertThat(summary.totalReceivable()).isEqualByComparingTo(new BigDecimal("5000000"));
    assertThat(summary.totalEstimatedProfit()).isEqualByComparingTo(new BigDecimal("9500000"));
    assertThat(summary.totalActualExpense()).isEqualByComparingTo(new BigDecimal("2700000"));
    assertThat(summary.totalPlannedExpense()).isEqualByComparingTo(new BigDecimal("3500000"));
    assertThat(summary.totalPayable()).isEqualByComparingTo(new BigDecimal("800000"));
    assertThat(summary.totalServiceExpense()).isEqualByComparingTo(new BigDecimal("1100000"));
    assertThat(summary.totalStateFeeExpense()).isEqualByComparingTo(new BigDecimal("1800000"));
    assertThat(summary.totalSupportExpense()).isEqualByComparingTo(new BigDecimal("600000"));
    assertThat(summary.totalLiquidationValue()).isEqualByComparingTo(new BigDecimal("5000000"));
    assertThat(summary.totalUninvoicedAmount()).isEqualByComparingTo(new BigDecimal("3500000"));
  }

  @Test
  void recycleBinSoftDeleteRestorePermanentDeleteAndBulkActionsWorkOnContracts() {
    CrmContract contract =
        CrmContract.builder()
            .id("c-trash")
            .contractNumber("PD261099")
            .tags("[\"SHTT\"]")
            .shared(false)
            .build();
    when(contractRepository.findById("c-trash")).thenReturn(Optional.of(contract));
    when(contractRepository.save(any(CrmContract.class))).thenAnswer(inv -> inv.getArgument(0));
    when(itemRepository.findByContractIdOrderBySortOrderAsc("c-trash")).thenReturn(List.of());

    contractService.delete("c-trash");
    assertThat(contract.isDeleted()).isTrue();
    assertThat(contract.getDeletedAt()).isNotNull();
    assertThat(contract.getDeletedBy()).isNotBlank();

    CrmContractDto restored = contractService.restore("c-trash");
    assertThat(restored.deleted()).isFalse();
    assertThat(restored.deletedAt()).isNull();

    when(contractRepository.findAllById(List.of("c-trash"))).thenReturn(List.of(contract));
    contractService.bulkAction(
        new org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest(
            List.of("c-trash"), "ASSIGN", "staff-9", "Lê Tùng", null, null));
    assertThat(contract.getAssignedUserId()).isEqualTo("staff-9");
    assertThat(contract.getAssignedUserName()).isEqualTo("Lê Tùng");

    contractService.bulkAction(
        new org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest(
            List.of("c-trash"), "SHARE", null, null, true, null));
    assertThat(contract.isShared()).isTrue();

    contractService.bulkAction(
        new org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest(
            List.of("c-trash"), "ADD_TAG", null, null, null, "Ưu tiên"));
    assertThat(contract.getTags()).contains("SHTT", "Ưu tiên");

    contractService.bulkAction(
        new org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest(
            List.of("c-trash"), "REMOVE_TAG", null, null, null, "shtt"));
    assertThat(contract.getTags()).doesNotContain("SHTT").contains("Ưu tiên");

    contractService.permanentDelete("c-trash");
    verify(cashflowRepository).deleteByContractId("c-trash");
    verify(itemRepository).deleteByContractId("c-trash");
    verify(contractRepository).delete(contract);
  }
}

package org.law_app.crm.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmContractService;
import org.law_app.crm.service.CrmContractService.ContractSearchResult;
import org.law_app.crm.service.CrmSupport;
import org.law_app.crm.web.CrmCaseController.Meta;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkImportRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CashflowCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractRevenueStatusRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractCashflowDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractListPayload;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crm/contracts")
@RequiredArgsConstructor
public class CrmContractController {

  private static final Map<String, String> SORTABLE =
      Map.ofEntries(
          Map.entry("bookingDate", "bookingDate"),
          Map.entry("paymentDate", "paymentDate"),
          Map.entry("orderDate", "orderDate"),
          Map.entry("createdAt", "createdAt"),
          Map.entry("updatedAt", "updatedAt"),
          Map.entry("contractNumber", "contractNumber"),
          Map.entry("orderValue", "orderValue"),
          Map.entry("collectedAmount", "collectedAmount"),
          Map.entry("receivableAmount", "receivableAmount"),
          Map.entry("estimatedProfit", "estimatedProfit"),
          Map.entry("revenueStatus", "revenueStatus"),
          Map.entry("executionStatus", "executionStatus"));

  private final CrmContractService contractService;

  @GetMapping
  public ApiResponse<CrmContractListPayload> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String revenueStatus,
      @RequestParam(required = false) String executionStatus,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String department,
      @RequestParam(required = false) String accountId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate bookingFrom,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate bookingTo,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate paymentFrom,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate paymentTo,
      @RequestParam(required = false) String preset,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    PageRequest pageable =
        PageRequest.of(page, size, CrmSupport.resolveSort(sort, SORTABLE, "bookingDate"));
    ContractSearchResult result =
        contractService.search(
            CurrentUser.id(),
            keyword,
            revenueStatus,
            executionStatus,
            assignedTo,
            department,
            accountId,
            bookingFrom,
            bookingTo,
            paymentFrom,
            paymentTo,
            preset,
            pageable);
    return ApiResponse.<CrmContractListPayload>builder()
        .code(200)
        .data(result.payload())
        .meta(
            new Meta(
                result.page().getNumber(),
                result.page().getSize(),
                result.page().getTotalElements(),
                result.page().getTotalPages()))
        .build();
  }

  @GetMapping("/{id}")
  public ApiResponse<CrmContractDto> detail(@PathVariable String id) {
    return ApiResponse.ok(contractService.get(id));
  }

  @PostMapping
  public ApiResponse<CrmContractDto> create(@RequestBody ContractUpsertRequest req) {
    return ApiResponse.ok(contractService.create(req), "Đã tạo hợp đồng");
  }

  @PutMapping("/{id}")
  public ApiResponse<CrmContractDto> update(
      @PathVariable String id, @RequestBody ContractUpsertRequest req) {
    return ApiResponse.ok(contractService.update(id, req), "Đã cập nhật hợp đồng");
  }

  @PutMapping("/{id}/revenue-status")
  public ApiResponse<CrmContractDto> updateRevenueStatus(
      @PathVariable String id, @RequestBody ContractRevenueStatusRequest req) {
    return ApiResponse.ok(
        contractService.updateRevenueStatus(id, req != null ? req.revenueStatus() : null),
        "Đã cập nhật trạng thái ghi nhận doanh số");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    contractService.delete(id);
    return ApiResponse.ok(null, "Đã xóa hợp đồng");
  }

  @GetMapping("/{id}/cashflows")
  public ApiResponse<List<CrmContractCashflowDto>> listCashflows(
      @PathVariable String id, @RequestParam(required = false) String type) {
    return ApiResponse.ok(contractService.listCashflows(id, type));
  }

  @PostMapping("/{id}/cashflows")
  public ApiResponse<CrmContractCashflowDto> addCashflow(
      @PathVariable String id, @RequestBody CashflowCreateRequest req) {
    return ApiResponse.ok(contractService.addCashflow(id, req), "Đã ghi nhận khoản thu/chi");
  }

  @DeleteMapping("/{id}/cashflows/{cashflowId}")
  public ApiResponse<Void> deleteCashflow(
      @PathVariable String id, @PathVariable String cashflowId) {
    contractService.deleteCashflow(id, cashflowId);
    return ApiResponse.ok(null, "Đã xóa khoản thu/chi");
  }

  @PostMapping("/import")
  public ApiResponse<Map<String, Integer>> importContracts(
      @RequestBody BulkImportRequest<ContractUpsertRequest> req) {
    int count = contractService.importContracts(req != null ? req.items() : List.of());
    return ApiResponse.ok(Map.of("imported", count), "Đã nhập danh sách hợp đồng");
  }
}

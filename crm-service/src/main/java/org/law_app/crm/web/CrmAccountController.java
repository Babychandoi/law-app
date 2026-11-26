package org.law_app.crm.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmAccountService;
import org.law_app.crm.service.CrmSupport;
import org.law_app.crm.web.CrmCaseController.Meta;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountContactCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkImportRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountContactDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountOverviewDto;
import org.springframework.data.domain.Page;
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
@RequestMapping("/crm/accounts")
@RequiredArgsConstructor
public class CrmAccountController {

  private static final Map<String, String> SORTABLE =
      Map.ofEntries(
          Map.entry("createdAt", "createdAt"),
          Map.entry("updatedAt", "updatedAt"),
          Map.entry("deletedAt", "deletedAt"),
          Map.entry("deletedBy", "deletedBy"),
          Map.entry("code", "code"),
          Map.entry("customerName", "customerName"),
          Map.entry("customerStatus", "customerStatus"),
          Map.entry("rankLabel", "rankLabel"),
          Map.entry("annualRevenue", "annualRevenue"));

  private final CrmAccountService accountService;

  @GetMapping
  public ApiResponse<List<CrmAccountDto>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String customerStatus,
      @RequestParam(required = false) String careStatus,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String serviceGroup,
      @RequestParam(required = false) String billingProvince,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) String filters,
      @RequestParam(defaultValue = "false") boolean deleted,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    PageRequest pageable =
        PageRequest.of(page, size, CrmSupport.resolveSort(sort, SORTABLE, "createdAt"));
    Page<CrmAccountDto> result =
        accountService.search(
            CurrentUser.id(),
            keyword,
            customerStatus,
            careStatus,
            assignedTo,
            serviceGroup,
            billingProvince,
            from,
            to,
            filters,
            deleted,
            pageable);
    return ApiResponse.<List<CrmAccountDto>>builder()
        .code(200)
        .data(result.getContent())
        .meta(
            new Meta(
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()))
        .build();
  }

  @GetMapping("/{id}")
  public ApiResponse<CrmAccountDto> detail(@PathVariable String id) {
    return ApiResponse.ok(accountService.get(id));
  }

  @GetMapping("/{id}/overview")
  public ApiResponse<CrmAccountOverviewDto> overview(@PathVariable String id) {
    return ApiResponse.ok(accountService.overview(id));
  }

  @PostMapping
  public ApiResponse<CrmAccountDto> create(@RequestBody AccountUpsertRequest req) {
    return ApiResponse.ok(accountService.create(req), "Đã tạo khách hàng");
  }

  @PutMapping("/{id}")
  public ApiResponse<CrmAccountDto> update(
      @PathVariable String id, @RequestBody AccountUpsertRequest req) {
    return ApiResponse.ok(accountService.update(id, req), "Đã cập nhật khách hàng");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    accountService.delete(id);
    return ApiResponse.ok(null, "Đã chuyển khách hàng vào Thùng rác");
  }

  @PostMapping("/{id}/restore")
  public ApiResponse<CrmAccountDto> restore(@PathVariable String id) {
    return ApiResponse.ok(accountService.restore(id), "Đã khôi phục khách hàng");
  }

  @DeleteMapping("/{id}/permanent")
  public ApiResponse<Void> permanentDelete(@PathVariable String id) {
    accountService.permanentDelete(id);
    return ApiResponse.ok(null, "Đã xóa vĩnh viễn khách hàng");
  }

  @PostMapping("/bulk-action")
  public ApiResponse<Map<String, Integer>> bulkAction(@RequestBody BulkActionRequest req) {
    int count = accountService.bulkAction(req);
    return ApiResponse.ok(Map.of("affected", count), "Đã thực hiện thao tác hàng loạt");
  }

  @PostMapping("/{id}/contacts")
  public ApiResponse<CrmAccountContactDto> addContact(
      @PathVariable String id, @RequestBody AccountContactCreateRequest req) {
    return ApiResponse.ok(accountService.addContact(id, req), "Đã thêm người liên hệ");
  }

  @DeleteMapping("/{id}/contacts/{contactId}")
  public ApiResponse<Void> deleteContact(@PathVariable String id, @PathVariable String contactId) {
    accountService.deleteContact(id, contactId);
    return ApiResponse.ok(null, "Đã xóa người liên hệ");
  }

  @PostMapping("/import")
  public ApiResponse<Map<String, Integer>> importAccounts(
      @RequestBody BulkImportRequest<AccountUpsertRequest> req) {
    int count = accountService.importAccounts(req != null ? req.items() : List.of());
    return ApiResponse.ok(Map.of("imported", count), "Đã nhập danh sách khách hàng");
  }
}

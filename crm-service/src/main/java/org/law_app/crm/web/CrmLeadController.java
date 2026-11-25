package org.law_app.crm.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmLeadService;
import org.law_app.crm.service.CrmSupport;
import org.law_app.crm.web.CrmCaseController.Meta;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkImportRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLeadDto;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertResponse;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadUpsertRequest;
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
@RequestMapping("/crm/leads")
@RequiredArgsConstructor
public class CrmLeadController {

  private static final Map<String, String> SORTABLE =
      Map.of(
          "createdAt", "createdAt",
          "updatedAt", "updatedAt",
          "code", "code",
          "customerName", "customerName",
          "fullName", "fullName",
          "customerStatus", "customerStatus",
          "leadSource", "leadSource",
          "lastInteractedAt", "lastInteractedAt");

  private final CrmLeadService leadService;

  @GetMapping
  public ApiResponse<List<CrmLeadDto>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String customerStatus,
      @RequestParam(required = false) String leadSource,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String serviceGroup,
      @RequestParam(required = false) String province,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    PageRequest pageable =
        PageRequest.of(page, size, CrmSupport.resolveSort(sort, SORTABLE, "createdAt"));
    Page<CrmLeadDto> result =
        leadService.search(
            CurrentUser.id(),
            keyword,
            customerStatus,
            leadSource,
            assignedTo,
            serviceGroup,
            province,
            from,
            to,
            pageable);
    return ApiResponse.<List<CrmLeadDto>>builder()
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
  public ApiResponse<CrmLeadDto> detail(@PathVariable String id) {
    return ApiResponse.ok(leadService.get(id));
  }

  @PostMapping
  public ApiResponse<CrmLeadDto> create(@RequestBody LeadUpsertRequest req) {
    return ApiResponse.ok(leadService.create(req), "Đã tạo tiềm năng liên hệ");
  }

  @PutMapping("/{id}")
  public ApiResponse<CrmLeadDto> update(
      @PathVariable String id, @RequestBody LeadUpsertRequest req) {
    return ApiResponse.ok(leadService.update(id, req), "Đã cập nhật tiềm năng liên hệ");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    leadService.delete(id);
    return ApiResponse.ok(null, "Đã xóa tiềm năng liên hệ");
  }

  @PostMapping("/{id}/convert")
  public ApiResponse<LeadConvertResponse> convert(
      @PathVariable String id, @RequestBody(required = false) LeadConvertRequest req) {
    return ApiResponse.ok(leadService.convert(id, req), "Đã chuyển đổi sang khách hàng");
  }

  @PostMapping("/import")
  public ApiResponse<Map<String, Integer>> importLeads(
      @RequestBody BulkImportRequest<LeadUpsertRequest> req) {
    int count = leadService.importLeads(req != null ? req.items() : List.of());
    return ApiResponse.ok(Map.of("imported", count), "Đã nhập dữ liệu KH liên hệ");
  }
}

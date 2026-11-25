package org.law_app.crm.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmOpportunityService;
import org.law_app.crm.service.CrmSupport;
import org.law_app.crm.web.CrmCaseController.Meta;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkImportRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmKanbanColumnDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityStageRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityUpsertRequest;
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
@RequestMapping("/crm/opportunities")
@RequiredArgsConstructor
public class CrmOpportunityController {

  private static final Map<String, String> SORTABLE =
      Map.of(
          "createdAt", "createdAt",
          "updatedAt", "updatedAt",
          "code", "code",
          "opportunityName", "opportunityName",
          "expectedRevenue", "expectedRevenue",
          "expectedCloseDate", "expectedCloseDate",
          "stage", "stage");

  private final CrmOpportunityService opportunityService;

  @GetMapping
  public ApiResponse<List<CrmOpportunityDto>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String stage,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String serviceGroup,
      @RequestParam(required = false) String accountId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    PageRequest pageable =
        PageRequest.of(page, size, CrmSupport.resolveSort(sort, SORTABLE, "createdAt"));
    Page<CrmOpportunityDto> result =
        opportunityService.search(
            CurrentUser.id(),
            keyword,
            stage,
            assignedTo,
            serviceGroup,
            accountId,
            from,
            to,
            pageable);
    return ApiResponse.<List<CrmOpportunityDto>>builder()
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

  @GetMapping("/kanban")
  public ApiResponse<List<CrmKanbanColumnDto>> kanban(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String serviceGroup) {
    return ApiResponse.ok(
        opportunityService.kanban(CurrentUser.id(), keyword, assignedTo, serviceGroup));
  }

  @GetMapping("/{id}")
  public ApiResponse<CrmOpportunityDto> detail(@PathVariable String id) {
    return ApiResponse.ok(opportunityService.get(id));
  }

  @PostMapping
  public ApiResponse<CrmOpportunityDto> create(@RequestBody OpportunityUpsertRequest req) {
    return ApiResponse.ok(opportunityService.create(req), "Đã tạo cơ hội hợp đồng");
  }

  @PutMapping("/{id}")
  public ApiResponse<CrmOpportunityDto> update(
      @PathVariable String id, @RequestBody OpportunityUpsertRequest req) {
    return ApiResponse.ok(opportunityService.update(id, req), "Đã cập nhật cơ hội hợp đồng");
  }

  @PutMapping("/{id}/stage")
  public ApiResponse<CrmOpportunityDto> updateStage(
      @PathVariable String id, @RequestBody OpportunityStageRequest req) {
    return ApiResponse.ok(
        opportunityService.updateStage(id, req != null ? req.stage() : null),
        "Đã chuyển giai đoạn cơ hội");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    opportunityService.delete(id);
    return ApiResponse.ok(null, "Đã xóa cơ hội hợp đồng");
  }

  @PostMapping("/{id}/convert-contract")
  public ApiResponse<CrmContractDto> convertToContract(@PathVariable String id) {
    return ApiResponse.ok(opportunityService.convertToContract(id), "Đã tạo hợp đồng từ cơ hội");
  }

  @PostMapping("/import")
  public ApiResponse<Map<String, Integer>> importOpportunities(
      @RequestBody BulkImportRequest<OpportunityUpsertRequest> req) {
    int count = opportunityService.importOpportunities(req != null ? req.items() : List.of());
    return ApiResponse.ok(Map.of("imported", count), "Đã nhập danh sách cơ hội");
  }
}

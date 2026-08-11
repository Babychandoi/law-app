package org.law_app.crm.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CareLog;
import org.law_app.crm.security.CookieBearerTokenResolver;
import org.law_app.crm.service.CrmCaseService;
import org.law_app.crm.service.DocumentContextService;
import org.law_app.crm.service.StaffDirectoryService;
import org.law_app.crm.service.StaffDirectoryService.StaffUser;
import org.law_app.crm.web.CrmDtos.AssignRequest;
import org.law_app.crm.web.CrmDtos.CareLogRequest;
import org.law_app.crm.web.CrmDtos.CaseDetail;
import org.law_app.crm.web.CrmDtos.CaseRow;
import org.law_app.crm.web.CrmDtos.DocumentContext;
import org.law_app.crm.web.CrmDtos.TagsRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crm")
@RequiredArgsConstructor
@Validated
public class CrmCaseController {

  private static final CacheControl DOCUMENT_CONTEXT_CACHE_CONTROL = CacheControl.noStore();

  private final CrmCaseService caseService;
  private final DocumentContextService documentContextService;
  private final StaffDirectoryService directoryService;

  /** Advanced filter — the daily operations screen. */
  @GetMapping("/cases")
  public ApiResponse<List<CaseRow>> cases(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Long careStatusId,
      @RequestParam(required = false) String assignedTo,
      @RequestParam(required = false) String followUp,
      @RequestParam(required = false) Long tagId,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int size) {
    PageRequest pageable = PageRequest.of(page, size, resolveSort(sort));
    // Non-admins only ever see cases assigned to themselves, regardless of the requested filter.
    String effectiveAssignedTo = CurrentUser.isAdmin() ? assignedTo : "me";
    Page<CaseRow> result =
        caseService.search(
            CurrentUser.id(),
            keyword,
            status,
            careStatusId,
            effectiveAssignedTo,
            followUp,
            tagId,
            pageable);
    return ApiResponse.<List<CaseRow>>builder()
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

  /**
   * Returns the normalized case snapshot used by the document automation workflow. PII remains
   * protected: an operator can only read a case assigned to them; administrators can read all
   * cases.
   */
  @GetMapping("/cases/{id}")
  public ApiResponse<CaseDetail> detail(@PathVariable String id) {
    var c = caseService.requireCase(id);
    boolean allowed = CurrentUser.isAdmin() || CurrentUser.id().equals(c.getAssignedUserId());
    if (!allowed) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.FORBIDDEN,
          "Chỉ người phụ trách hoặc quản trị viên được xem hồ sơ");
    }
    return ApiResponse.ok(caseService.detail(id));
  }

  /**
   * Resolves an authorized, minimized context for a document-generation request.
   *
   * <p>Only an administrator or the current assignee may read the context. The response includes
   * canonical case/customer/service facts and active party facts needed by common legal templates;
   * it deliberately excludes encrypted payloads, identity-document data, party contact details,
   * care notes, and free-text notes. The response is never cacheable.
   */
  @GetMapping("/cases/{caseId}/document-context")
  public ResponseEntity<ApiResponse<DocumentContext>> documentContext(
      @PathVariable("caseId") @NotBlank @Size(max = 36) String caseId) {
    return ResponseEntity.ok()
        .cacheControl(DOCUMENT_CONTEXT_CACHE_CONTROL)
        .body(ApiResponse.ok(documentContextService.resolve(caseId)));
  }

  /** Only admins assign cases. */
  @PutMapping("/cases/{id}/assign")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CaseRow> assign(
      @PathVariable String id, @RequestBody AssignRequest req, HttpServletRequest request) {
    CaseRow row = caseService.assign(id, req.userId());
    // Notify the newly-assigned staff member (skip when un-assigning / assigning to self).
    if (req.userId() != null && !req.userId().isBlank() && !req.userId().equals(CurrentUser.id())) {
      directoryService.notifyCaseAssigned(
          extractToken(request), req.userId(), id, row.serviceName());
    }
    return ApiResponse.ok(row);
  }

  /**
   * Change the case status (Mới→Đang xử lý→...). Admin or the assignee only; proxied to monolith
   * which is the source of truth and re-syncs back via event.
   */
  @PutMapping("/cases/{id}/status")
  public ApiResponse<Void> changeStatus(
      @PathVariable String id, @RequestBody StatusRequest req, HttpServletRequest request) {
    var c = caseService.requireCase(id);
    boolean allowed = CurrentUser.isAdmin() || CurrentUser.id().equals(c.getAssignedUserId());
    if (!allowed) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.FORBIDDEN, "Chỉ người phụ trách hoặc admin");
    }
    directoryService.changeCaseStatus(extractToken(request), id, req.status());
    return ApiResponse.ok(null, "Đã đổi trạng thái");
  }

  public record StatusRequest(String status) {}

  @GetMapping("/cases/{id}/care-logs")
  public ApiResponse<List<CareLog>> careLogs(@PathVariable String id) {
    return ApiResponse.ok(caseService.history(id));
  }

  @PostMapping("/cases/{id}/care-logs")
  public ApiResponse<CareLog> recordCare(
      @PathVariable String id, @Valid @RequestBody CareLogRequest req) {
    return ApiResponse.ok(caseService.recordCare(id, CurrentUser.id(), req));
  }

  @PutMapping("/cases/{id}/tags")
  public ApiResponse<CaseRow> setTags(@PathVariable String id, @RequestBody TagsRequest req) {
    return ApiResponse.ok(caseService.setTags(id, req.tagIds()));
  }

  /** Staff directory for the assignee dropdown. */
  @GetMapping("/users")
  public ApiResponse<List<StaffUser>> users(HttpServletRequest request) {
    return ApiResponse.ok(directoryService.listStaff(extractToken(request)));
  }

  private String extractToken(HttpServletRequest request) {
    if (request.getCookies() != null) {
      for (Cookie c : request.getCookies()) {
        if (CookieBearerTokenResolver.ACCESS_COOKIE.equals(c.getName())
            && c.getValue() != null
            && !c.getValue().isBlank()) {
          return c.getValue();
        }
      }
    }
    String auth = request.getHeader("Authorization");
    return auth != null && auth.startsWith("Bearer ") ? auth.substring(7) : null;
  }

  public record Meta(int page, int pageSize, long totalElements, int totalPages) {}

  /** Cột được phép sắp xếp phía server (whitelist chống injection). Map key FE -> field entity. */
  private static final java.util.Map<String, String> SORTABLE =
      java.util.Map.of(
          "caseCreatedAt", "caseCreatedAt",
          "nextFollowUpAt", "nextFollowUpAt",
          "lastCaredAt", "lastCaredAt",
          "status", "status",
          "customer", "serviceName");

  /** Phân tích "field,dir"; chỉ chấp nhận cột trong whitelist, mặc định mới nhất trước. */
  private static Sort resolveSort(String sort) {
    Sort fallback = Sort.by(Sort.Direction.DESC, "caseCreatedAt");
    if (sort == null || sort.isBlank()) {
      return fallback;
    }
    String[] parts = sort.split(",");
    String field = SORTABLE.get(parts[0].trim());
    if (field == null) {
      return fallback;
    }
    Sort.Direction dir =
        parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
    return Sort.by(dir, field);
  }
}

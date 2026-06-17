package org.law_app.crm.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CareLog;
import org.law_app.crm.security.CookieBearerTokenResolver;
import org.law_app.crm.service.CrmCaseService;
import org.law_app.crm.service.StaffDirectoryService;
import org.law_app.crm.service.StaffDirectoryService.StaffUser;
import org.law_app.crm.web.CrmDtos.AssignRequest;
import org.law_app.crm.web.CrmDtos.CareLogRequest;
import org.law_app.crm.web.CrmDtos.CaseRow;
import org.law_app.crm.web.CrmDtos.TagsRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
public class CrmCaseController {

  private final CrmCaseService caseService;
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
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int size) {
    PageRequest pageable =
        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "caseCreatedAt"));
    Page<CaseRow> result =
        caseService.search(
            CurrentUser.id(), keyword, status, careStatusId, assignedTo, followUp, tagId, pageable);
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

  @PutMapping("/cases/{id}/assign")
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
}

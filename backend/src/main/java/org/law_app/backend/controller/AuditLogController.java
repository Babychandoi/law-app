package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.ApiMeta;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.entity.AuditLog;
import org.law_app.backend.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Nhật ký kiểm toán — chỉ ADMIN xem. */
@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {
  AuditService auditService;

  /** Thống kê hoạt động admin (analytics P2.12). */
  @GetMapping("/stats")
  ApiResponse<AuditService.StatsResponse> stats(@RequestParam(defaultValue = "30") int days) {
    return ApiResponse.<AuditService.StatsResponse>builder()
        .message("Audit stats retrieved successfully")
        .data(auditService.stats(days))
        .build();
  }

  @GetMapping
  ApiResponse<List<AuditLog>> list(
      @RequestParam(required = false) String targetType,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String q,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<AuditLog> logs = auditService.search(targetType, action, q, pageable);
    return ApiResponse.<List<AuditLog>>builder()
        .message("Audit logs retrieved successfully")
        .data(logs.getContent())
        .meta(ApiMeta.from(logs))
        .build();
  }
}

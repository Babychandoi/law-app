package org.law_app.crm.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmActivityService;
import org.law_app.crm.web.EnterpriseCrmDtos.ActivityCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmActivityDto;
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
@RequestMapping("/crm/activities")
@RequiredArgsConstructor
public class CrmActivityController {

  private final CrmActivityService activityService;

  @GetMapping
  public ApiResponse<List<CrmActivityDto>> list(
      @RequestParam(required = false) String entityType,
      @RequestParam(required = false) String entityId) {
    return ApiResponse.ok(activityService.list(entityType, entityId));
  }

  @PostMapping
  public ApiResponse<CrmActivityDto> create(@RequestBody ActivityCreateRequest req) {
    return ApiResponse.ok(activityService.create(req), "Đã tạo hoạt động");
  }

  @PutMapping("/{id}/toggle-complete")
  public ApiResponse<CrmActivityDto> toggleComplete(@PathVariable String id) {
    return ApiResponse.ok(activityService.toggleComplete(id), "Đã cập nhật trạng thái hoạt động");
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable String id) {
    activityService.delete(id);
    return ApiResponse.ok(null, "Đã xóa hoạt động");
  }
}

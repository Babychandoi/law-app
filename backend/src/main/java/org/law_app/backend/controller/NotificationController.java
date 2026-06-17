package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class NotificationController {
  NotificationService notificationService;

  @GetMapping
  public ApiResponse<List<NotificationResponse>> getNotifications() {
    var context = SecurityContextHolder.getContext();
    String userId = context.getAuthentication().getName();
    return ApiResponse.<List<NotificationResponse>>builder()
        .message("Notifications retrieved successfully")
        .data(notificationService.getNotificationsByUserId(userId))
        .build();
  }

  @PutMapping("/read")
  public ApiResponse<Boolean> markAsReadAll() {
    return ApiResponse.<Boolean>builder()
        .message("Notification marked as read successfully")
        .data(notificationService.markNotificationAsReadAll())
        .build();
  }

  @PutMapping("/{id}/read")
  public ApiResponse<Boolean> markAsRead(@PathVariable String id) {
    return ApiResponse.<Boolean>builder()
        .message("Notification marked as read successfully")
        .data(notificationService.markNotificationAsRead(id))
        .build();
  }

  /** Called by the CRM service when a case is assigned, to notify the assignee. */
  @PostMapping("/assign-case")
  public ApiResponse<Void> notifyCaseAssigned(@RequestBody AssignNotifyRequest req) {
    notificationService.notifyCaseAssigned(req.userId(), req.caseId(), req.serviceName());
    return ApiResponse.<Void>builder().message("Notified").build();
  }

  public record AssignNotifyRequest(String userId, String caseId, String serviceName) {}
}

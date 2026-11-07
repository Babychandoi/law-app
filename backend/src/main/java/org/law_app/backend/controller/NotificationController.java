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

  @GetMapping("/page")
  public ApiResponse<List<NotificationResponse>> getNotificationPage(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    var pageable =
        org.springframework.data.domain.PageRequest.of(
            Math.max(0, page),
            Math.min(100, Math.max(1, size)),
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Order.desc("createdAt"),
                org.springframework.data.domain.Sort.Order.desc("id")));
    var notifications = notificationService.getNotificationPage(userId, pageable);
    return ApiResponse.<List<NotificationResponse>>builder()
        .data(notifications.getContent())
        .meta(org.law_app.backend.dto.response.ApiMeta.from(notifications))
        .build();
  }

  @GetMapping("/unread-count")
  public ApiResponse<Long> getUnreadCount() {
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    return ApiResponse.<Long>builder().data(notificationService.getUnreadCount(userId)).build();
  }

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

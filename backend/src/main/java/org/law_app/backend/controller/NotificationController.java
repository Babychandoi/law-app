package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.CustomerService;
import org.law_app.backend.entity.Notification;
import org.law_app.backend.entity.NotificationUser;
import org.law_app.backend.repository.NotificationUserRepository;
import org.law_app.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class NotificationController {
    NotificationService notificationService;

    @GetMapping("/{userId}")
    public ApiResponse<List<NotificationResponse>> getNotifications(@PathVariable String userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .message("Notifications retrieved successfully")
                .data(notificationService.getNotificationsByUserId(userId))
                .build();
    }


    @PutMapping("/{id}/read")
    public ApiResponse<Boolean> markAsRead(@PathVariable String id) {
        return  ApiResponse.<Boolean>builder()
                .message("Notification marked as read successfully")
                .data(notificationService.markNotificationAsRead(id))
                .build();
    }
}

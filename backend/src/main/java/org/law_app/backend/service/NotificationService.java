package org.law_app.backend.service;

import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.NotificationUser;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotificationsByUserId(String userId);
    Boolean markNotificationAsRead(String notificationId);
    void notifyUser(NotificationUser notificationUser);
}

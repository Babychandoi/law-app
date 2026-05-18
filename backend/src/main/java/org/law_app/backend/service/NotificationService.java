package org.law_app.backend.service;

import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.Notification;
import org.law_app.backend.entity.NotificationUser;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotificationsByUserId(String userId);
    Boolean markNotificationAsRead(String notificationId);
    Boolean markNotificationAsReadAll();
    void createNotification(Notification notification);
    void createChatNotification(String guestId, String messageContent);
}

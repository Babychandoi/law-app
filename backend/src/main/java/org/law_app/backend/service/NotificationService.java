package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.Notification;

public interface NotificationService {
  List<NotificationResponse> getNotificationsByUserId(String userId);

  Boolean markNotificationAsRead(String notificationId);

  Boolean markNotificationAsReadAll();

  void createNotification(Notification notification);

  void createChatNotification(String guestId, String messageContent);
}

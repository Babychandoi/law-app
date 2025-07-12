package org.law_app.backend.mapper;

import org.law_app.backend.dto.response.NotificationMessage;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.NotificationUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    default NotificationResponse toNotificationResponse(NotificationUser notificationUser) {
        return NotificationResponse.builder()
                .id(notificationUser.getId())
                .read(notificationUser.isRead())
                .createdAt(notificationUser.getCreatedAt())
                .userId(notificationUser.getUser().getId())
                .customerServiceName(notificationUser.getNotification().getCustomerService() != null
                        ? notificationUser.getNotification().getCustomerService().getName()
                        : null)
                .serviceName(notificationUser.getNotification().getCustomerService().getService() != null
                        ? notificationUser.getNotification().getCustomerService().getService().getTitle()
                        : null)
                .build();
    }
    default NotificationMessage toNotificationMessage(NotificationUser notificationUser) {
        return NotificationMessage.builder()
                .id(notificationUser.getId())
                .userId(notificationUser.getUser().getId())
                .customerServiceName(notificationUser.getNotification().getCustomerService() != null
                        ? notificationUser.getNotification().getCustomerService().getName()
                        : null)
                .serviceName(notificationUser.getNotification().getCustomerService().getService() != null
                        ? notificationUser.getNotification().getCustomerService().getService().getTitle()
                        : null)
                .createdAt(notificationUser.getCreatedAt())
                .read(notificationUser.isRead())
                .build();
    }
}

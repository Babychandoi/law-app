package org.law_app.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.response.NotificationMessage;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.NotificationUser;
import org.law_app.backend.entity.User;
import org.law_app.backend.mapper.NotificationMapper;
import org.law_app.backend.repository.NotificationUserRepository;
import org.law_app.backend.repository.UserRepository;
import org.law_app.backend.service.NotificationService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class NotificationServiceImpl implements NotificationService {
    StringRedisTemplate redisTemplate;
    NotificationMapper notificationMapper;
    NotificationUserRepository notificationUserRepository;
    UserRepository userRepository;
    public void notifyUser(NotificationUser notificationUser) {
        try {
            NotificationMessage msg = notificationMapper.toNotificationMessage(notificationUser);
            redisTemplate.convertAndSend("notifications", new ObjectMapper().writeValueAsString(msg));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<NotificationResponse> getNotificationsByUserId(String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<NotificationUser> notifications = notificationUserRepository.findByUser(user);
            List<NotificationResponse> notificationResponses = new ArrayList<>(notifications.stream()
                    .map(notificationMapper::toNotificationResponse)
                    .toList());
            notificationResponses.sort((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()));
            return notificationResponses;
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    @Override
    public Boolean markNotificationAsRead(String notificationId) {
        try {
            NotificationUser notification = notificationUserRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            if (notification != null) {
                notification.setRead(true);
                notification.setReadAt(new Date());
                notificationUserRepository.save(notification);
                return true;
            }
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", e.getMessage());
            throw e;
        }
        return false;
    }
}

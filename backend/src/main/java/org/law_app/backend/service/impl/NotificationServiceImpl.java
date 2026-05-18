package org.law_app.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.response.NotificationMessage;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.Conversation;
import org.law_app.backend.entity.Notification;
import org.law_app.backend.entity.NotificationUser;
import org.law_app.backend.entity.User;
import org.law_app.backend.mapper.NotificationMapper;
import org.law_app.backend.repository.ConversationRepository;
import org.law_app.backend.repository.NotificationRepository;
import org.law_app.backend.repository.NotificationUserRepository;
import org.law_app.backend.repository.UserRepository;
import org.law_app.backend.service.NotificationService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class NotificationServiceImpl implements NotificationService {
    StringRedisTemplate redisTemplate;
    NotificationMapper notificationMapper;
    NotificationUserRepository notificationUserRepository;
    NotificationRepository notificationRepository;
    UserRepository userRepository;
    ConversationRepository conversationRepository;
    private void notifyUser(NotificationUser notificationUser) {
        try {
            NotificationMessage msg = notificationMapper.toNotificationMessage(notificationUser);
            redisTemplate.convertAndSend("notifications", new ObjectMapper().writeValueAsString(msg));
        } catch (Exception e) {
            log.error("Error notifying user: {}", e.getMessage());
        }
    }

    @Override
    public void createNotification(Notification notification) {
        try{
            notification = notificationRepository.save(notification);
            List<User> users = userRepository.findAll();
            for (User user : users) {
                NotificationUser notificationUser = NotificationUser.builder()
                        .notification(notification)
                        .user(user)
                        .read(false)
                        .build();
                notificationUserRepository.save(notificationUser);
                notificationUserRepository.flush();
                notifyUser(notificationUser);
            }

        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage());
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

    @Override
    public Boolean markNotificationAsReadAll() {
        try {
            var context = SecurityContextHolder.getContext();
            String userId = context.getAuthentication().getName();
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            List<NotificationUser> notifications = notificationUserRepository.findByUser(user);
            notifications.forEach(notification -> notification.setRead(true));
            notificationUserRepository.saveAll(notifications);
            return true;
        }catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void createChatNotification(String guestId, String messageContent) {
        try {
            // Get conversation to retrieve guest name
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            
            String guestName;
            if (conversationOpt.isPresent() && conversationOpt.get().getGuestName() != null) {
                guestName = conversationOpt.get().getGuestName();
            } else {
                // Fallback to guest ID if name not available
                guestName = "Khách hàng " + guestId.substring(Math.max(0, guestId.length() - 8));
            }
            
            String title = "Tin nhắn mới từ khách hàng";
            String contentPreview = messageContent.length() > 50 
                ? messageContent.substring(0, 50) + "..." 
                : messageContent;
            String content = String.format("%s: %s", guestName, contentPreview);
            
            Notification notification = Notification.builder()
                    .title(title)
                    .content(content)
                    .type("CHAT")
                    .link("/2025/luatpoip/admin/chats")
                    .referenceId(guestId)
                    .createdAt(new Date())
                    .customerService(null) // No customer service for chat notifications
                    .build();
            
            notification = notificationRepository.save(notification);
            
            // Create notification for all admin users
            List<User> adminUsers = userRepository.findAll().stream()
                    .filter(user -> "ADMIN".equals(user.getRole().name()))
                    .toList();
            
            for (User user : adminUsers) {
                NotificationUser notificationUser = NotificationUser.builder()
                        .notification(notification)
                        .user(user)
                        .read(false)
                        .build();
                notificationUserRepository.save(notificationUser);
                notificationUserRepository.flush();
                notifyUser(notificationUser);
            }
            
            log.info("Created chat notification for guest: {} ({})", guestId, guestName);
        } catch (Exception e) {
            log.error("Error creating chat notification for guest {}: {}", guestId, e.getMessage());
        }
    }
}

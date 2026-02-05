package org.law_app.backend.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.law_app.backend.dto.response.NotificationMessage;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RedisNotificationSubscriber implements MessageListener {
    private final NotificationWebSocketHandler handler;

    @Override
    public void onMessage(Message message, @NotNull byte[] pattern) {
        try {
            String msg = new String(message.getBody());
            NotificationMessage notification = new ObjectMapper().readValue(msg, NotificationMessage.class);
            handler.sendToUser(notification.getUserId(), msg);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse notification message", e);

            // Handle the exception, e.g., log it or send an error response
        }
    }
}
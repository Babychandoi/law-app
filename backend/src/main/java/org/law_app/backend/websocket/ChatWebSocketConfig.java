package org.law_app.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
public class ChatWebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000", "http://103.56.160.193:3000", "https://luatpoip.com")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.taskExecutor()
                .corePoolSize(8) // Adjust based on expected load
                .maxPoolSize(16)
                .queueCapacity(100);
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, org.springframework.messaging.MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                System.out.println("Received STOMP command: " + accessor.getCommand()); // Debug log
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String guestId = accessor.getFirstNativeHeader("guestId");
                    String adminId = accessor.getFirstNativeHeader("adminId");
                    String userId = guestId != null ? guestId : adminId;
                    if (userId != null && !userId.trim().isEmpty()) {
                        System.out.println("Setting user principal: " + userId); // Debug log
                        accessor.setUser(new UserPrincipal(userId));
                    } else {
                        System.err.println("Warning: No guestId or adminId provided in STOMP CONNECT header");
                    }
                }
                return message;
            }
        });
    }
}

class UserPrincipal implements Principal {
    private final String name;

    public UserPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}

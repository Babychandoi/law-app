package org.law_app.backend.websocket;

import java.security.Principal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Guest chat WebSocket. Guests are anonymous (no account), so the connection stays public, but
 * identity/role are derived server-side, never trusted from the client:
 *
 * <ul>
 *   <li>Spring Security authenticates the handshake from the httpOnly accessToken cookie (via
 *       CookieBearerTokenResolver); a logged-in staff user arrives as an authenticated principal
 *       with ROLE_ADMIN. Anonymous visitors get a guest principal (their client guestId) here.
 *   <li>Only admins may subscribe to {@code /topic/admin/**} — the frame is dropped otherwise, so a
 *       visitor cannot eavesdrop on every conversation.
 *   <li>Messages sent over the socket are always treated as GUEST (see ChatController); admin
 *       replies go through the authenticated REST endpoint {@code /chat/admin/send}.
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class ChatWebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry
        .addEndpoint("/ws")
        .setAllowedOriginPatterns(
            "http://localhost:3000",
            "http://103.56.160.193:3000",
            "https://luatpoip.com",
            "https://stage.luatpoip.com")
        .withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.taskExecutor().corePoolSize(8).maxPoolSize(16).queueCapacity(100);
    registration.interceptors(
        new ChannelInterceptor() {
          @Override
          public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
            StompCommand command = accessor.getCommand();

            if (StompCommand.CONNECT.equals(command)) {
              // Only name anonymous guests; leave the Spring Security principal untouched.
              if (accessor.getUser() == null) {
                String guestId = accessor.getFirstNativeHeader("guestId");
                if (guestId != null && !guestId.isBlank()) {
                  accessor.setUser(new ChatPrincipal(guestId, false));
                }
              }
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
              String destination = accessor.getDestination();
              if (destination != null
                  && destination.startsWith("/topic/admin")
                  && !isAdmin(accessor.getUser())) {
                log.warn("Blocked non-admin subscription to {}", destination);
                return null; // drop the SUBSCRIBE frame without killing the connection
              }
            }
            return message;
          }
        });
  }

  /** Admin iff Spring Security authenticated the session with ROLE_ADMIN. */
  private boolean isAdmin(Principal user) {
    if (user instanceof Authentication auth) {
      return auth.getAuthorities().stream()
          .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
    return false;
  }
}

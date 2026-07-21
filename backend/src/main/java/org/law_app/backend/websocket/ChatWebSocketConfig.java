package org.law_app.backend.websocket;

import jakarta.servlet.http.Cookie;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.security.CookieUtil;
import org.law_app.backend.security.CustomJwtDecoder;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

/**
 * Guest chat WebSocket. Guests are anonymous (no account), so the connection stays public, but
 * identity/role are derived server-side, never trusted from the client:
 *
 * <ul>
 *   <li>The httpOnly {@code accessToken} cookie is read at the SockJS handshake; a valid ADMIN
 *       token marks the STOMP principal as admin.
 *   <li>Only admins may subscribe to {@code /topic/admin/**}; a guest may only subscribe to its own
 *       {@code /topic/chat/{guestId}} (the guestId it connected with).
 *   <li>Messages sent over the socket are always treated as GUEST (see ChatController); admin
 *       replies go through the authenticated REST endpoint {@code /chat/admin/send}.
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private static final String TOKEN_ATTR = "accessToken";

  private final CustomJwtDecoder jwtDecoder;

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
        .addInterceptors(new CookieCapturingHandshakeInterceptor())
        .withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration
        .taskExecutor()
        .corePoolSize(8)
        .maxPoolSize(16)
        .queueCapacity(100);
    registration.interceptors(
        new ChannelInterceptor() {
          @Override
          public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
            StompCommand command = accessor.getCommand();

            if (StompCommand.CONNECT.equals(command)) {
              handleConnect(accessor);
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
              enforceSubscribeAcl(accessor);
            }
            return message;
          }
        });
  }

  /** Derive the principal at CONNECT: admin if a valid ADMIN token was presented, else the guest. */
  private void handleConnect(StompHeaderAccessor accessor) {
    boolean admin = false;
    Map<String, Object> attrs = accessor.getSessionAttributes();
    String token = attrs == null ? null : (String) attrs.get(TOKEN_ATTR);
    if (token != null && !token.isBlank()) {
      try {
        Jwt jwt = jwtDecoder.decode(token);
        admin = "ADMIN".equals(String.valueOf(jwt.getClaim("scope")));
        log.info("WS connect authenticated, admin={}", admin);
      } catch (Exception e) {
        log.warn("WS connect: token present but invalid/expired, treating as guest");
      }
    }

    String guestId = accessor.getFirstNativeHeader("guestId");
    String adminId = accessor.getFirstNativeHeader("adminId");
    // Principal name is the guestId for guests; admins are identified by role, not by a
    // client-supplied adminId.
    String name = guestId != null ? guestId : (adminId != null ? adminId : "guest");
    accessor.setUser(new ChatPrincipal(name, admin));
  }

  /** Block eavesdropping: admin topics require an admin; a guest topic requires the owning guest. */
  private void enforceSubscribeAcl(StompHeaderAccessor accessor) {
    String destination = accessor.getDestination();
    if (destination == null) {
      return;
    }
    Principal user = accessor.getUser();
    boolean admin = user instanceof ChatPrincipal p && p.isAdmin();

    if (destination.startsWith("/topic/admin")) {
      if (!admin) {
        throw new IllegalArgumentException("Forbidden: admin subscription requires admin auth");
      }
      return;
    }

    if (destination.startsWith("/topic/chat/")) {
      if (admin) {
        return; // admins may watch any conversation
      }
      String topicGuestId = destination.substring("/topic/chat/".length());
      String principalName = user == null ? null : user.getName();
      if (principalName == null || !principalName.equals(topicGuestId)) {
        throw new IllegalArgumentException("Forbidden: cannot subscribe to another conversation");
      }
    }
  }

  /** Copies the httpOnly accessToken cookie from the SockJS handshake into the session attrs. */
  static class CookieCapturingHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Map<String, Object> attributes) {
      if (request instanceof ServletServerHttpRequest servletRequest) {
        Cookie[] cookies = servletRequest.getServletRequest().getCookies();
        if (cookies != null) {
          for (Cookie c : cookies) {
            if (CookieUtil.ACCESS_COOKIE.equals(c.getName()) && c.getValue() != null) {
              attributes.put(TOKEN_ATTR, c.getValue());
              break;
            }
          }
        }
      }
      return true;
    }

    @Override
    public void afterHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Exception exception) {
      // no-op
    }
  }
}

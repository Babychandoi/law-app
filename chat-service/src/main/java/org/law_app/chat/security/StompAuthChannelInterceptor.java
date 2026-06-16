package org.law_app.chat.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.chat.config.StompPrincipal;
import org.law_app.chat.service.PresenceService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

/**
 * Authenticates the STOMP CONNECT by verifying the JWT passed in the {@code Authorization} native
 * header (offline, shared secret) and binding the userId as the session principal. This is stricter
 * than the monolith's guest chat, which accepts an unauthenticated client-supplied id.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

  private final JwtDecoder jwtDecoder;
  private final PresenceService presenceService;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String bearer = accessor.getFirstNativeHeader("Authorization");
      if (bearer == null || !bearer.startsWith("Bearer ")) {
        throw new IllegalArgumentException("Missing bearer token on STOMP CONNECT");
      }
      try {
        Jwt jwt = jwtDecoder.decode(bearer.substring(7));
        String userId = jwt.getSubject();
        accessor.setUser(new StompPrincipal(userId));
        presenceService.markOnline(userId);
        log.debug("STOMP connected: {}", userId);
      } catch (JwtException e) {
        throw new IllegalArgumentException("Invalid JWT on STOMP CONNECT", e);
      }
    } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
      if (accessor.getUser() != null) {
        presenceService.markOffline(accessor.getUser().getName());
      }
    }
    return message;
  }
}

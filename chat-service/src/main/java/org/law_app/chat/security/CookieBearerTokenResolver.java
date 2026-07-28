package org.law_app.chat.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;

/**
 * REST requests to chat-service carry the JWT in the shared {@code accessToken} httpOnly cookie
 * (forwarded by the gateway). Falls back to the Authorization header for internal/service calls.
 */
@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

  public static final String ACCESS_COOKIE = "accessToken";

  private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

  @Override
  public String resolve(HttpServletRequest request) {
    if (request.getCookies() != null) {
      for (Cookie c : request.getCookies()) {
        if (ACCESS_COOKIE.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
          return c.getValue();
        }
      }
    }
    return headerResolver.resolve(request);
  }
}

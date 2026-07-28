package org.law_app.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;

/**
 * Resolves the JWT from the httpOnly {@code accessToken} cookie, falling back to the standard
 * Authorization: Bearer header (keeps older clients / internal calls working during migration).
 */
@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

  private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

  @Override
  public String resolve(HttpServletRequest request) {
    if (request.getCookies() != null) {
      for (Cookie c : request.getCookies()) {
        if (CookieUtil.ACCESS_COOKIE.equals(c.getName())
            && c.getValue() != null
            && !c.getValue().isBlank()) {
          return c.getValue();
        }
      }
    }
    return headerResolver.resolve(request);
  }
}

package org.law_app.document.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;

/**
 * Reads the JWT from the shared httpOnly accessToken cookie, falling back to Authorization header.
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

package org.law_app.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds the httpOnly auth cookies shared across *.luatpoip.com. Access token cookie is sent on
 * every request; refresh token cookie is scoped to {@code /auth} so it never leaks elsewhere.
 */
@Component
public class CookieUtil {

  public static final String ACCESS_COOKIE = "accessToken";
  public static final String REFRESH_COOKIE = "refreshToken";

  @Value("${auth.cookie.domain:}")
  private String domain; // e.g. ".luatpoip.com"; empty = host-only (dev/localhost)

  @Value("${auth.cookie.secure:true}")
  private boolean secure;

  @Value("${jwt.valid-duration}")
  private long validDuration;

  @Value("${jwt.refreshable-duration}")
  private long refreshableDuration;

  public ResponseCookie accessCookie(String token) {
    return base(ACCESS_COOKIE, token, "/", validDuration).build();
  }

  public ResponseCookie refreshCookie(String token) {
    return base(REFRESH_COOKIE, token, "/auth", refreshableDuration).build();
  }

  public ResponseCookie clearAccessCookie() {
    return base(ACCESS_COOKIE, "", "/", 0).build();
  }

  public ResponseCookie clearRefreshCookie() {
    return base(REFRESH_COOKIE, "", "/auth", 0).build();
  }

  private ResponseCookie.ResponseCookieBuilder base(
      String name, String value, String path, long maxAge) {
    ResponseCookie.ResponseCookieBuilder b =
        ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(secure)
            .sameSite("Lax")
            .path(path)
            .maxAge(maxAge);
    if (domain != null && !domain.isBlank()) {
      b.domain(domain);
    }
    return b;
  }
}

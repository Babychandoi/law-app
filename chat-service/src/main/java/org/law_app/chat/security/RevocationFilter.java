package org.law_app.chat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * After the JWT is validated (signature + expiry), reject it if the monolith has blacklisted its
 * jti on logout. Keeps the same Redis key convention as the monolith: {@code revoked:{jti}}.
 */
@Component
@RequiredArgsConstructor
public class RevocationFilter extends OncePerRequestFilter {

  private static final String REVOKED_PREFIX = "revoked:";

  private final StringRedisTemplate redisTemplate;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth instanceof JwtAuthenticationToken jwtAuth) {
      Jwt jwt = jwtAuth.getToken();
      String jti = jwt.getId();
      if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey(REVOKED_PREFIX + jti))) {
        SecurityContextHolder.clearContext();
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token revoked");
        return;
      }
    }
    chain.doFilter(request, response);
  }
}

package org.law_app.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import java.io.IOException;
import java.util.List;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Adds an edge-cacheable Cache-Control header to a whitelist of PUBLIC, user-independent GET
 * endpoints so Cloudflare can serve repeat requests from its edge instead of crossing the tunnel
 * back to this machine (~400ms saved per cache HIT).
 *
 * <p>Safety: only GET, only the explicit whitelist, and only when the request carries NO
 * Authorization header / auth cookie (so authenticated/admin responses are never cached). {@code
 * s-maxage} targets the CDN; {@code max-age=0} keeps browsers revalidating so users never see stale
 * data for long.
 */
@Component
@Order(50)
public class PublicCacheFilter extends OncePerRequestFilter {

  private static final long S_MAXAGE_SECONDS = 300; // 5 phút ở Cloudflare edge

  // Path prefixes that are public + the same for everyone + change infrequently.
  private static final List<String> CACHEABLE_PREFIXES =
      List.of(
          "/services",
          "/service/page",
          "/service/previous-partners",
          "/service/process-timeline",
          "/service/hero",
          "/service/process");

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    if (isCacheable(request)) {
      response.setHeader(
          "Cache-Control", "public, max-age=0, s-maxage=" + S_MAXAGE_SECONDS);
    }
    chain.doFilter(request, response);
  }

  private boolean isCacheable(HttpServletRequest request) {
    if (!HttpMethod.GET.matches(request.getMethod())) {
      return false;
    }
    // Never cache authenticated requests. Only the auth token matters — an unrelated analytics /
    // Cloudflare cookie must NOT disable caching (that would make every real request a MISS).
    if (request.getHeader("Authorization") != null || hasAuthCookie(request)) {
      return false;
    }
    String path = request.getRequestURI();
    return CACHEABLE_PREFIXES.stream().anyMatch(path::startsWith);
  }

  private boolean hasAuthCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) {
      return false;
    }
    for (Cookie c : cookies) {
      if (("accessToken".equals(c.getName()) || "refreshToken".equals(c.getName()))
          && c.getValue() != null
          && !c.getValue().isBlank()) {
        return true;
      }
    }
    return false;
  }
}

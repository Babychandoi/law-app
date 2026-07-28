package org.law_app.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import java.util.List;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Makes a whitelist of PUBLIC, user-independent GET endpoints edge-cacheable so Cloudflare can
 * serve repeat requests from its edge instead of crossing the tunnel back to this machine (~400ms
 * saved per cache HIT).
 *
 * <p>Two things are needed for Cloudflare to actually cache:
 *
 * <ol>
 *   <li>{@code Cache-Control: s-maxage} on the response (added here).
 *   <li>NO {@code Set-Cookie} on the response — Cloudflare BYPASSES cache for any response carrying
 *       a cookie. Spring Security's CSRF support sets an XSRF-TOKEN cookie on every request, so for
 *       these public GETs we suppress it via a response wrapper.
 * </ol>
 *
 * <p>Safety: only GET, only the explicit whitelist, and never when the request is authenticated
 * (Authorization header or auth cookie present).
 */
@Component
@Order(50)
public class PublicCacheFilter extends OncePerRequestFilter {

  private static final long S_MAXAGE_SECONDS = 300; // 5 phút ở Cloudflare edge

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
      response.setHeader("Cache-Control", "public, max-age=0, s-maxage=" + S_MAXAGE_SECONDS);
      // Suppress any Set-Cookie (e.g. CSRF XSRF-TOKEN) so Cloudflare will cache the response.
      chain.doFilter(request, new NoCookieResponseWrapper(response));
      return;
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

  /** Drops Set-Cookie writes so the response stays cacheable by the CDN. */
  private static class NoCookieResponseWrapper extends HttpServletResponseWrapper {
    NoCookieResponseWrapper(HttpServletResponse response) {
      super(response);
    }

    @Override
    public void addCookie(Cookie cookie) {
      // swallow
    }

    @Override
    public void setHeader(String name, String value) {
      if ("Set-Cookie".equalsIgnoreCase(name)) return;
      super.setHeader(name, value);
    }

    @Override
    public void addHeader(String name, String value) {
      if ("Set-Cookie".equalsIgnoreCase(name)) return;
      super.addHeader(name, value);
    }
  }
}

package org.law_app.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window rate limiting (Redis) for sensitive public endpoints — brute force on login and spam
 * on lead/subscribe/apply/upload. Keyed by the real client IP (behind Cloudflare tunnel).
 *
 * <p>Fail-open: if Redis is unavailable the request is allowed, so a Redis blip never takes the
 * site down. Chat/AI abuse is throttled separately per-guest in the WebSocket handler.
 */
@Component
@Order(5)
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

  /** method + path prefix -> max requests per window. */
  private record Rule(String method, String prefix, int limit, int windowSeconds, String bucket) {}

  private static final List<Rule> RULES =
      List.of(
          new Rule("POST", "/auth/login", 10, 300, "login"),
          new Rule("POST", "/auth/refresh", 60, 300, "refresh"),
          new Rule("POST", "/customer", 5, 60, "lead"),
          new Rule("POST", "/news/subscribe", 5, 60, "subscribe"),
          new Rule("POST", "/jobs/apply", 5, 300, "apply"),
          new Rule("POST", "/upload", 30, 60, "upload"));

  private final RedisTemplate<String, String> redisTemplate;

  public RateLimitFilter(RedisTemplate<String, String> redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    Rule rule = matchRule(request);
    if (rule != null && isOverLimit(rule, clientIp(request), response)) {
      return; // 429 already written
    }
    chain.doFilter(request, response);
  }

  private Rule matchRule(HttpServletRequest request) {
    String method = request.getMethod();
    String path = request.getRequestURI();
    for (Rule r : RULES) {
      if (r.method().equalsIgnoreCase(method) && path.startsWith(r.prefix())) {
        return r;
      }
    }
    return null;
  }

  private boolean isOverLimit(Rule rule, String ip, HttpServletResponse response)
      throws IOException {
    String key = "rl:" + rule.bucket() + ":" + ip;
    try {
      Long count = redisTemplate.opsForValue().increment(key);
      if (count != null && count == 1L) {
        redisTemplate.expire(key, Duration.ofSeconds(rule.windowSeconds()));
      }
      if (count != null && count > rule.limit()) {
        writeTooManyRequests(response, rule.windowSeconds());
        return true;
      }
    } catch (Exception e) {
      // Fail-open: never block real traffic because Redis hiccuped.
      log.warn("Rate limit check skipped (Redis error): {}", e.getMessage());
    }
    return false;
  }

  private void writeTooManyRequests(HttpServletResponse response, int retryAfter)
      throws IOException {
    response.setStatus(429);
    response.setHeader("Retry-After", String.valueOf(retryAfter));
    response.setContentType("application/json;charset=UTF-8");
    response
        .getWriter()
        .write("{\"code\":429,\"message\":\"Bạn thao tác quá nhanh, vui lòng thử lại sau.\"}");
  }

  /** Real client IP behind Cloudflare tunnel / nginx, falling back to the socket address. */
  private String clientIp(HttpServletRequest request) {
    String cf = request.getHeader("CF-Connecting-IP");
    if (cf != null && !cf.isBlank()) {
      return cf.trim();
    }
    String xff = request.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      return xff.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}

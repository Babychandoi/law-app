package org.law_app.gateway;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * HSTS cho gateway.luatpoip.com.
 *
 * <p>TLS kết thúc ở Cloudflare, cloudflared gọi gateway bằng HTTP thuần nên không có cơ chế nào tự
 * thêm header này.
 *
 * <p>Dùng WebFilter chứ KHÔNG dùng GlobalFilter: GlobalFilter chỉ chạy sau khi request khớp một
 * route, nên đường dẫn không khớp (ví dụ / trả 404) sẽ không có header — đúng thứ mà công cụ quét
 * kiểm tra đầu tiên. WebFilter chạy trước bước định tuyến nên phủ mọi response.
 *
 * <p>Chỉ gửi khi biết chắc request gốc là HTTPS. KHÔNG gửi vô điều kiện: chạy gateway local qua
 * http://localhost thì trình duyệt sẽ ghi nhớ và ép localhost sang HTTPS, hỏng môi trường dev.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HstsHeaderFilter implements WebFilter {

  private static final String VALUE = "max-age=31536000; includeSubDomains";

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    HttpHeaders headers = exchange.getRequest().getHeaders();
    if (isHttps(headers.getFirst("X-Forwarded-Proto"), headers.getFirst("CF-Visitor"))) {
      exchange.getResponse().getHeaders().set("Strict-Transport-Security", VALUE);
    }
    return chain.filter(exchange);
  }

  /**
   * Cloudflare gửi CF-Visitor, cloudflared gửi X-Forwarded-Proto — không có gì bảo đảm cả hai đều
   * có mặt, nên nhận cả hai. Nếu chỉ dựa vào một cái mà cái đó vắng thì header âm thầm không bao giờ
   * được gửi, đúng kiểu lỗi im lặng khó phát hiện.
   */
  static boolean isHttps(String forwardedProto, String cfVisitor) {
    return "https".equalsIgnoreCase(forwardedProto)
        || (cfVisitor != null && cfVisitor.contains("\"https\""));
  }
}

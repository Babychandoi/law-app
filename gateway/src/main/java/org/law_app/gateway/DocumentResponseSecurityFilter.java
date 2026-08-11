package org.law_app.gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Legal documents routinely contain personal and privileged information. Keep document API
 * responses out of browser/proxy caches and attach defensive response headers at the single public
 * entry point. The service repeats authorization checks; this filter is defence in depth.
 */
@Component
public class DocumentResponseSecurityFilter implements GlobalFilter, Ordered {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getPath().value();
    if (!path.equals("/documents") && !path.startsWith("/documents/")) {
      return chain.filter(exchange);
    }

    HttpHeaders headers = exchange.getResponse().getHeaders();
    headers.setCacheControl(CacheControl.noStore().cachePrivate().getHeaderValue());
    headers.setPragma("no-cache");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Cross-Origin-Resource-Policy", "same-site");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    return chain.filter(exchange);
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }
}

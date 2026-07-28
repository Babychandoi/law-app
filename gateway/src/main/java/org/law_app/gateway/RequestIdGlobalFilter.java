package org.law_app.gateway;

import java.util.UUID;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Correlation ID tại cửa ngõ: đảm bảo mỗi request có header X-Request-Id (tự sinh nếu chưa có) và
 * FORWARD xuống các service phía sau, để log của gateway + backend/chat/crm/document cùng một id.
 */
@Component
public class RequestIdGlobalFilter implements GlobalFilter, Ordered {

  public static final String HEADER = "X-Request-Id";

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String existing = exchange.getRequest().getHeaders().getFirst(HEADER);
    String id =
        (existing == null || existing.isBlank())
            ? UUID.randomUUID().toString().substring(0, 8)
            : existing;

    ServerHttpRequest mutated = exchange.getRequest().mutate().header(HEADER, id).build();
    exchange.getResponse().getHeaders().set(HEADER, id);
    return chain.filter(exchange.mutate().request(mutated).build());
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}

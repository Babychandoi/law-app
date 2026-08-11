package org.law_app.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

class DocumentResponseSecurityFilterTest {

  private final DocumentResponseSecurityFilter filter = new DocumentResponseSecurityFilter();

  @Test
  void protectsDocumentResponsesFromCachingAndEmbedding() {
    var exchange =
        MockServerWebExchange.from(MockServerHttpRequest.get("/documents/generated/123/download"));

    filter.filter(exchange, ignored -> Mono.empty()).block();

    var headers = exchange.getResponse().getHeaders();
    assertThat(headers.getCacheControl()).contains("no-store").contains("private");
    assertThat(headers.getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
    assertThat(headers.getFirst("X-Frame-Options")).isEqualTo("DENY");
    assertThat(headers.getFirst("Content-Security-Policy")).contains("frame-ancestors 'none'");
  }

  @Test
  void protectsTheDocumentApiRoot() {
    var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/documents"));

    filter.filter(exchange, ignored -> Mono.empty()).block();

    assertThat(exchange.getResponse().getHeaders().getCacheControl())
        .contains("no-store")
        .contains("private");
  }

  @Test
  void leavesOtherApiResponsesUntouched() {
    var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/crm/cases"));

    filter.filter(exchange, ignored -> Mono.empty()).block();

    assertThat(exchange.getResponse().getHeaders().getCacheControl()).isNull();
    assertThat(exchange.getResponse().getHeaders().getFirst("X-Frame-Options")).isNull();
  }
}

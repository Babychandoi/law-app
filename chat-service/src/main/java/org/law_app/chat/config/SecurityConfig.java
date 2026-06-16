package org.law_app.chat.config;

import java.util.Arrays;
import java.util.List;
import org.law_app.chat.security.RevocationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

  @Value("${cors.allowed-origins}")
  private String allowedOrigins;

  @Value("${auth.cookie.domain:}")
  private String cookieDomain;

  private final RevocationFilter revocationFilter;
  private final org.law_app.chat.security.CookieBearerTokenResolver cookieBearerTokenResolver;

  public SecurityConfig(
      RevocationFilter revocationFilter,
      org.law_app.chat.security.CookieBearerTokenResolver cookieBearerTokenResolver) {
    this.revocationFilter = revocationFilter;
    this.cookieBearerTokenResolver = cookieBearerTokenResolver;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
    csrfHandler.setCsrfRequestAttributeName(null);

    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        // Double-submit CSRF, same scheme as the monolith (shared XSRF-TOKEN cookie). WebSocket
        // handshake is exempt (no cookie-driven state-change there).
        .csrf(
            csrf ->
                csrf.csrfTokenRepository(csrfTokenRepository())
                    .csrfTokenRequestHandler(csrfHandler)
                    .ignoringRequestMatchers("/ws-staff/**"))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // WebSocket handshake is authenticated by the STOMP CONNECT interceptor.
                    .requestMatchers("/ws-staff/**")
                    .permitAll()
                    .requestMatchers("/actuator/health")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(
            oauth2 ->
                oauth2
                    .bearerTokenResolver(cookieBearerTokenResolver)
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())))
        .addFilterAfter(revocationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  /** Map the monolith's {@code scope} claim (e.g. "ADMIN") to a ROLE_ authority. */
  private JwtAuthenticationConverter jwtAuthConverter() {
    JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
    scopes.setAuthorityPrefix("ROLE_");
    scopes.setAuthoritiesClaimName("scope");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(
        jwt -> {
          var auths = scopes.convert(jwt);
          // scope is a single string ("ADMIN"/"USER"), not space-delimited — normalize.
          return auths.isEmpty()
              ? List.of(new SimpleGrantedAuthority("ROLE_" + jwt.getClaimAsString("scope")))
              : auths;
        });
    return converter;
  }

  @Bean
  public CookieCsrfTokenRepository csrfTokenRepository() {
    CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
    repo.setCookieCustomizer(
        c -> {
          c.path("/");
          c.sameSite("Lax");
          if (cookieDomain != null && !cookieDomain.isBlank()) {
            c.domain(cookieDomain);
          }
        });
    return repo;
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}

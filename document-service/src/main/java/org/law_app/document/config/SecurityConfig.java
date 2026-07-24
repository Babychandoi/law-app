package org.law_app.document.config;

import java.util.List;
import org.law_app.document.security.CookieBearerTokenResolver;
import org.law_app.document.security.RevocationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Value("${auth.cookie.domain:}")
  private String cookieDomain;

  private final RevocationFilter revocationFilter;
  private final CookieBearerTokenResolver cookieBearerTokenResolver;

  public SecurityConfig(
      RevocationFilter revocationFilter, CookieBearerTokenResolver cookieBearerTokenResolver) {
    this.revocationFilter = revocationFilter;
    this.cookieBearerTokenResolver = cookieBearerTokenResolver;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
    csrfHandler.setCsrfRequestAttributeName(null);

    http.cors(AbstractHttpConfigurer::disable)
        .csrf(
            csrf ->
                csrf.csrfTokenRepository(csrfTokenRepository())
                    .csrfTokenRequestHandler(csrfHandler))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/actuator/health", "/actuator/health/**", "/actuator/prometheus")
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

  private JwtAuthenticationConverter jwtAuthConverter() {
    JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
    scopes.setAuthorityPrefix("ROLE_");
    scopes.setAuthoritiesClaimName("scope");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(
        jwt -> {
          var auths = scopes.convert(jwt);
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
}

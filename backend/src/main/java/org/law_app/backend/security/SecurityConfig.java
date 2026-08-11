package org.law_app.backend.security;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private final String[] AuthorizedUrls =
      new String[] {
        "/auth/login",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/customer",
        "/news/subscribe",
        "/jobs/apply"
      };
  private final String[] AuthorizedUrlsPublic =
      new String[] {
        "/service/**",
        "/services/**",
        "/jobs/**",
        "/news/**",
        "/chat/{guestId}",
        "/chat/conversation",
        // Chỉ trang landing đã xuất bản; bản nháp bị service lọc bỏ, không lộ ra ngoài.
        "/landing/page",
        "/sitemap.xml",
        "/og/**"
      };

  @Autowired private CustomJwtDecoder customJwtDecoder;
  @Autowired private CookieBearerTokenResolver cookieBearerTokenResolver;

  @Value("${auth.cookie.domain:}")
  private String cookieDomain;

  // Auth-bootstrap + public unauthenticated POSTs: no CSRF token exists yet / no cookie session.
  private final String[] CsrfIgnored =
      new String[] {
        "/auth/login",
        "/auth/refresh",
        "/auth/logout",
        "/customer",
        "/news/subscribe",
        "/jobs/apply"
      };

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(
            request ->
                request
                    .requestMatchers(HttpMethod.POST, AuthorizedUrls)
                    .permitAll()
                    // ===== KHU HỆ THỐNG: chỉ ADMIN (đặt TRƯỚC các permitAll GET rộng) =====
                    // Dữ liệu PII: hồ sơ ứng viên + người đăng ký. Trước đây lọt vào GET /jobs/**,
                    // /news/** permitAll -> lộ công khai. Chặn về ADMIN trước khi mở public GET.
                    .requestMatchers(HttpMethod.GET, "/jobs/applications", "/jobs/*/applications")
                    .hasRole("ADMIN")
                    .requestMatchers("/jobs/applications/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/news/subscribers", "/news/subscribers/**")
                    .hasRole("ADMIN")
                    // Ghi nội dung website (dịch vụ/bài viết) + tin tuyển dụng: chỉ ADMIN.
                    // POST public (/jobs/apply, /news/subscribe, /customer) đã permitAll ở trên nên
                    // được khớp trước, không bị chặn.
                    .requestMatchers(
                        HttpMethod.POST, "/services/**", "/service/**", "/jobs/**", "/news/**")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.PUT, "/services/**", "/service/**", "/jobs/**", "/news/**")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.DELETE, "/services/**", "/service/**", "/jobs/**", "/news/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, AuthorizedUrlsPublic)
                    .permitAll()
                    // Quản lý landing (kể cả xem danh sách bản nháp) chỉ dành cho ADMIN.
                    // Đặt sau permitAll ở trên nên GET /landing/page vẫn public.
                    .requestMatchers("/landing/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/chat/*")
                    .permitAll() // Allow guest to get their messages
                    .requestMatchers(HttpMethod.POST, "/chat/conversation")
                    .permitAll() // Allow guest to create conversation
                    .requestMatchers("/ws/**")
                    .permitAll()
                    // Actuator chỉ lắng nghe trên management port nội bộ (9100, không route ra
                    // internet) nên cho phép health + prometheus để Docker/Prometheus scrape.
                    .requestMatchers(
                        "/actuator/health", "/actuator/health/**", "/actuator/prometheus")
                    .permitAll()
                    .anyRequest()
                    .authenticated());
    http.oauth2ResourceServer(
        oauth2 ->
            oauth2
                .bearerTokenResolver(cookieBearerTokenResolver)
                .jwt(
                    jwtConfigurer ->
                        jwtConfigurer
                            .decoder(customJwtDecoder)
                            .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

    // CSRF: double-submit cookie. Server sets a JS-readable XSRF-TOKEN cookie; the SPA echoes it
    // back in the X-XSRF-TOKEN header on POST/PUT/DELETE, and Spring compares the two. Required now
    // that auth rides in cookies (header bearer tokens were inherently CSRF-safe).
    CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
    csrfHandler.setCsrfRequestAttributeName(null); // opt out of deferred/BREACH token, plain value

    http.csrf(
        csrf ->
            csrf.csrfTokenRepository(csrfTokenRepository())
                .csrfTokenRequestHandler(csrfHandler)
                .ignoringRequestMatchers(CsrfIgnored));

    return http.build();
  }

  @Bean
  public CookieCsrfTokenRepository csrfTokenRepository() {
    CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
    // Share the token cookie across *.luatpoip.com so gateway/api/frontend all see it.
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
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(
        List.of(
            "http://localhost:3000",
            "http://103.56.160.193:3000",
            "https://luatpoip.com",
            "https://www.luatpoip.com",
            "https://stage.luatpoip.com")); // Nguồn gốc được phép (stage = test giao diện)
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public CorsFilter corsFilter() {
    return new CorsFilter(corsConfigurationSource());
  }

  @Bean
  JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter =
        new JwtGrantedAuthoritiesConverter();
    jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
    JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

    return jwtAuthenticationConverter;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
  }
}

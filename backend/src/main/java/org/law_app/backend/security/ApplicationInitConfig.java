package org.law_app.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.law_app.backend.entity.User;
import org.law_app.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Admin bootstrap/rotation. Credentials come from BOOTSTRAP_ADMIN_USERNAME /
 * BOOTSTRAP_ADMIN_PASSWORD: while both are set, the account is created if missing and its password
 * re-encoded (rotated) on every startup — so set them once to bootstrap or rotate, then remove
 * them. When either is missing the bootstrap is skipped entirely. The password is never logged.
 */
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
@Configuration
@Slf4j
public class ApplicationInitConfig {
  @Autowired private PasswordEncoder passwordEncoder;

  // @NonFinal so @FieldDefaults(makeFinal) does not pull these into the
  // @RequiredArgsConstructor (which would demand a non-existent String bean).
  @NonFinal
  @Value("${bootstrap.admin.username:}")
  String bootstrapAdminUsername;

  @NonFinal
  @Value("${bootstrap.admin.password:}")
  String bootstrapAdminPassword;

  @Bean
  ApplicationRunner init(UserRepository userRepository) {
    return args -> {
      if (bootstrapAdminUsername.isBlank() || bootstrapAdminPassword.isBlank()) {
        log.info("Admin bootstrap skipped: BOOTSTRAP_ADMIN_USERNAME/PASSWORD not set");
        return;
      }
      userRepository
          .findByUsername(bootstrapAdminUsername)
          .ifPresentOrElse(
              existing -> {
                // Env vars still set + account exists -> rotate the password.
                existing.setPassword(passwordEncoder.encode(bootstrapAdminPassword));
                userRepository.save(existing);
                log.warn("Bootstrap admin user '{}' password rotated", bootstrapAdminUsername);
              },
              () -> {
                User user =
                    User.builder()
                        .username(bootstrapAdminUsername)
                        .password(passwordEncoder.encode(bootstrapAdminPassword))
                        .role(Role.ADMIN)
                        .active(Active.ACTIVE)
                        .build();
                userRepository.save(user);
                log.warn("Bootstrap admin user '{}' created", bootstrapAdminUsername);
              });
    };
  }
}

package org.law_app.backend.security;


import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.law_app.backend.entity.User;
import org.law_app.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
@Configuration
@Slf4j
public class ApplicationInitConfig {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Bean
    ApplicationRunner init(UserRepository userRepository) {
        return args -> {
            if(userRepository.findByUsername("adminToTo").isEmpty()){
                User user = User.builder()
                        .username("adminToTo")
                        .password(passwordEncoder.encode("oanoanjiji"))
                        .role(Role.ADMIN)
                        .active(Active.ACTIVE)
                        .build();
                userRepository.save(user);
                log.warn("admin user has been created with default password: oanoanjiji");
            }};
    }
}

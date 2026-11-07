package org.law_app.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.LandingPageRepository;
import org.law_app.backend.service.LandingPageProvisioner;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Sinh landing nháp cho các dịch vụ đã tồn tại trước khi có tính năng này. Chạy mỗi lần khởi động
 * nhưng bỏ qua dịch vụ đã có landing, nên an toàn khi lặp lại.
 */
@Slf4j
@Configuration
public class LandingPageBackfillRunner {

  @Bean
  @ConditionalOnProperty(
      name = "app.landing.backfill-enabled",
      havingValue = "true",
      matchIfMissing = true)
  ApplicationRunner backfillLandingPages(
      ChildrenServiceRepository childrenServiceRepository,
      LandingPageRepository landingPageRepository,
      LandingPageProvisioner provisioner) {
    return args -> {
      int created = 0;
      for (ChildrenServices service : childrenServiceRepository.findAll()) {
        if (landingPageRepository.findByService(service).isPresent()) continue;
        provisioner.createDraftFor(service);
        created++;
      }
      if (created > 0) {
        log.info("Đã sinh {} landing page nháp cho dịch vụ có sẵn", created);
      }
    };
  }
}

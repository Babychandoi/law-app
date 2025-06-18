package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Hero;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.HeroRepository;
import org.law_app.backend.service.ChildrenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class ChildrenServiceImpl implements ChildrenService {
    ChildrenServiceRepository childrenServiceRepository;
    HeroRepository heroRepository;
    @Override
    @Transactional
    public Boolean createHero(HeroRequest heroRequest, String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            Hero hero = Hero.builder()
                    .title(heroRequest.getTitle())
                    .description(heroRequest.getDescription())
                    .subtitle(heroRequest.getSubtitle())
                    .service(childrenService)
                    .build();
            heroRepository.save(hero);
            return true;
        }catch (Exception e) {
            log.error("Error creating hero: {}", e.getMessage());
            throw  e;
        }
    }

    @Override
    public HeroResponse getHeroByServiceId(String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId).orElseThrow(
                    () -> new IllegalArgumentException("Service not found with id: " + serviceId));
            Hero hero = heroRepository.findByService(childrenService);
            if (hero == null) {
                throw new IllegalArgumentException("Hero not found for service id: " + serviceId);
            }
            return HeroResponse.builder()
                    .subtitle(hero.getSubtitle())
                    .title(hero.getTitle())
                    .description(hero.getDescription())
                    .build();
        }catch (Exception e) {
            log.error("Error fetching hero by service id: {}", e.getMessage());
            throw e;
        }
    }
}

package org.law_app.backend.service;

import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.entity.Hero;

public interface ChildrenService {
    Boolean createHero(HeroRequest heroRequest, String serviceId);
    HeroResponse getHeroByServiceId(String serviceId);
}

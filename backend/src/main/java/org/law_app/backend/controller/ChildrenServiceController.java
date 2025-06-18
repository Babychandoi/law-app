package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.service.ChildrenService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class ChildrenServiceController {
    ChildrenService childrenService;
    @GetMapping("/hero/{id}")
    ApiResponse<HeroResponse> getHeroById(@PathVariable String id) {
        return ApiResponse.<HeroResponse>builder()
                .message("Hero retrieved successfully")
                .data(childrenService.getHeroByServiceId(id))
                .build();
    }
    @PostMapping("/hero/{id}")
    ApiResponse<Boolean> createHero(@PathVariable String id, @RequestBody HeroRequest heroRequest) {
        return ApiResponse.<Boolean>builder()
                .message("Hero created successfully")
                .data(childrenService.createHero(heroRequest, id))
                .build();
    }
}

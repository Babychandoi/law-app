package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.request.PreviousPartnerRequest;
import org.law_app.backend.dto.request.ProcessRequest;
import org.law_app.backend.dto.request.ProcessTimeLineRequest;
import org.law_app.backend.dto.response.*;
import org.law_app.backend.service.ChildrenService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/process/{id}")
    ApiResponse<List<ProcessResponse>> getProcessById(@PathVariable String id) {
        return ApiResponse.<List<ProcessResponse>>builder()
                .message("Process retrieved successfully")
                .data(childrenService.getProcessByServiceId(id))
                .build();
    }
    @PostMapping("/process/{id}")
    ApiResponse<Boolean> createProcess(@PathVariable String id, @RequestBody List<ProcessRequest> processRequest) {
        return ApiResponse.<Boolean>builder()
                .message("Process created successfully")
                .data(childrenService.createProcess(id, processRequest))
                .build();
    }
    @GetMapping("/previous-partners")
    ApiResponse<List<PreviousPartnerResponse>> getPreviousPartners() {
        return ApiResponse.<List<PreviousPartnerResponse>>builder()
                .message("Previous partners retrieved successfully")
                .data(childrenService.getPreviousPartners())
                .build();
    }
    @PostMapping("/previous-partners")
    ApiResponse<Boolean> createPreviousPartner(@RequestBody List<PreviousPartnerRequest> previousPartner) {
        return ApiResponse.<Boolean>builder()
                .message("Previous partners created successfully")
                .data(childrenService.createPreviousPartner(previousPartner))
                .build();
    }
    @GetMapping("/process-timeline/{id}")
    ApiResponse<List<ProcessTimeLineResponse>> getProcessTimeLineById(@PathVariable String id) {
        return ApiResponse.<List<ProcessTimeLineResponse>>builder()
                .message("Process timeline retrieved successfully")
                .data(childrenService.getProcessTimeLineByServiceId(id))
                .build();
    }
    @PostMapping("/process-timeline/{id}")
    ApiResponse<Boolean> createProcessTimeLine(@PathVariable String id, @RequestBody List<ProcessTimeLineRequest> processTimeLineRequest) {
        return ApiResponse.<Boolean>builder()
                .message("Process timeline created successfully")
                .data(childrenService.createProcessTimeLine(id, processTimeLineRequest))
                .build();
    }
}

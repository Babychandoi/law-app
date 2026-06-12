package org.law_app.backend.controller;

import java.util.List;
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

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
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
  ApiResponse<Boolean> createProcess(
      @PathVariable String id, @RequestBody List<ProcessRequest> processRequest) {
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
  ApiResponse<Boolean> createPreviousPartner(
      @RequestBody List<PreviousPartnerRequest> previousPartner) {
    return ApiResponse.<Boolean>builder()
        .message("Previous partners created successfully")
        .data(childrenService.createPreviousPartner(previousPartner))
        .build();
  }

  // ===== CMS: quản lý dịch vụ qua admin =====

  /** Toàn bộ nội dung một trang dịch vụ theo đường dẫn (public, cho trang động) */
  @GetMapping("/page")
  ApiResponse<ServicePageResponse> getServicePage(@RequestParam("href") String href) {
    return ApiResponse.<ServicePageResponse>builder()
        .message("Service page retrieved successfully")
        .data(childrenService.getServicePage(href))
        .build();
  }

  @PostMapping("/children")
  ApiResponse<ChildrenServiceResponse> createChild(
      @RequestBody org.law_app.backend.dto.request.ChildrenServiceRequest request) {
    return ApiResponse.<ChildrenServiceResponse>builder()
        .message("Service created successfully")
        .data(childrenService.createChild(request))
        .build();
  }

  @PutMapping("/children/{id}")
  ApiResponse<Boolean> updateChild(
      @PathVariable String id,
      @RequestBody org.law_app.backend.dto.request.ChildrenServiceRequest request) {
    return ApiResponse.<Boolean>builder()
        .message("Service updated successfully")
        .data(childrenService.updateChild(id, request))
        .build();
  }

  @DeleteMapping("/children/{id}")
  ApiResponse<Boolean> deleteChild(@PathVariable String id) {
    return ApiResponse.<Boolean>builder()
        .message("Service deleted successfully")
        .data(childrenService.deleteChild(id))
        .build();
  }

  @PutMapping("/children/{id}/hero")
  ApiResponse<Boolean> upsertHero(@PathVariable String id, @RequestBody HeroRequest heroRequest) {
    return ApiResponse.<Boolean>builder()
        .message("Hero saved successfully")
        .data(childrenService.upsertHero(id, heroRequest))
        .build();
  }

  @PutMapping("/children/{id}/process")
  ApiResponse<Boolean> replaceProcess(
      @PathVariable String id, @RequestBody List<ProcessRequest> processRequests) {
    return ApiResponse.<Boolean>builder()
        .message("Process saved successfully")
        .data(childrenService.replaceProcess(id, processRequests))
        .build();
  }

  @PutMapping("/children/{id}/pricing")
  ApiResponse<Boolean> replacePricing(
      @PathVariable String id,
      @RequestBody List<org.law_app.backend.dto.request.PricingRequest> pricingRequests) {
    return ApiResponse.<Boolean>builder()
        .message("Pricing saved successfully")
        .data(childrenService.replacePricing(id, pricingRequests))
        .build();
  }

  @GetMapping("/children/{id}/sections")
  ApiResponse<List<ServiceSectionResponse>> getSections(@PathVariable String id) {
    return ApiResponse.<List<ServiceSectionResponse>>builder()
        .message("Sections retrieved successfully")
        .data(childrenService.getSections(id))
        .build();
  }

  @PutMapping("/children/{id}/sections")
  ApiResponse<Boolean> replaceSections(
      @PathVariable String id,
      @RequestBody List<org.law_app.backend.dto.request.ServiceSectionRequest> sectionRequests) {
    return ApiResponse.<Boolean>builder()
        .message("Sections saved successfully")
        .data(childrenService.replaceSections(id, sectionRequests))
        .build();
  }

  @GetMapping("/children")
  ApiResponse<List<ChildrenServiceResponse>> getAllChildren() {
    return ApiResponse.<List<ChildrenServiceResponse>>builder()
        .message("Children services retrieved successfully")
        .data(childrenService.getAllChildren())
        .build();
  }

  @PutMapping("/children/{id}/image")
  ApiResponse<Boolean> updateChildImage(
      @PathVariable String id, @RequestBody java.util.Map<String, String> body) {
    return ApiResponse.<Boolean>builder()
        .message("Service image updated successfully")
        .data(childrenService.updateChildImage(id, body.get("image")))
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
  ApiResponse<Boolean> createProcessTimeLine(
      @PathVariable String id, @RequestBody List<ProcessTimeLineRequest> processTimeLineRequest) {
    return ApiResponse.<Boolean>builder()
        .message("Process timeline created successfully")
        .data(childrenService.createProcessTimeLine(id, processTimeLineRequest))
        .build();
  }
}

package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.PricingRequest;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.request.ToToRequest;
import org.law_app.backend.dto.response.*;
import org.law_app.backend.entity.Pricing;
import org.law_app.backend.service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class ServiceController {
    ServiceService serviceService;
    @GetMapping
    ApiResponse<List<ServiceResponse>> getServices() {

        return ApiResponse.<List<ServiceResponse>>builder()
                .message("Services retrieved successfully")
                .data(serviceService.getServices())
                .build();
    }
    @PostMapping
    public boolean createService(@RequestBody ServiceRequest serviceRequest) {
        return serviceService.createService(serviceRequest);
    }
    @GetMapping("/{id}")
    public ApiResponse<List<ChildrenServiceResponse>> getChildrenServiceById(@PathVariable String id) {
        return ApiResponse.<List<ChildrenServiceResponse>>builder()
                .message("Children services retrieved successfully")
                .data(serviceService.getChildrenServiceById(id))
                .build();
    }
    @PostMapping("/fee/{id}")
    public ApiResponse<Boolean> createPricingByServiceId(@PathVariable String id, @RequestBody List<PricingRequest> pricingRequests) {
        return ApiResponse.<Boolean>builder()
                .message("Pricing created successfully")
                .data(serviceService.createPricingByServiceId(id, pricingRequests))
                .build();
    }
    @GetMapping("/fee/{id}")
    public ApiResponse<List<PricingResponse>> getPricingByServiceId(@PathVariable String id) {
        return ApiResponse.<List<PricingResponse>>builder()
                .message("Pricing retrieved successfully")
                .data(serviceService.getPricingByServiceId(id))
                .build();
    }
    @GetMapping("/toto")
    public ApiResponse<ToToResponse> getToTo() {
        return ApiResponse.<ToToResponse>builder()
                .message("ToTo retrieved successfully")
                .data(serviceService.getToTo())
                .build();
    }
    @PostMapping("/toto")
    public ApiResponse<Boolean> createToTo(@RequestBody ToToRequest toToRequest) {
        return ApiResponse.<Boolean>builder()
                .message("ToTo created successfully")
                .data(serviceService.createToTo(toToRequest))
                .build();
    }
}

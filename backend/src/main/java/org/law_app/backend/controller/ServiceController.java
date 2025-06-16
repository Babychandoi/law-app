package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.ServiceResponse;
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
}

package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.service.CustomerServices;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class CustomerController {
    CustomerServices customerServices;
    @PostMapping
    ApiResponse<Boolean> createCustomer(@RequestBody CustomerRequest request) {
        return ApiResponse.<Boolean>builder()
                .message("Customer created successfully")
                .data(customerServices.createCustomerService(request))
                .build();
    }
    @PutMapping("/status/{id}")
    ApiResponse<Boolean> updateCustomerStatus(@PathVariable String id, @RequestParam Status status) {
        return ApiResponse.<Boolean>builder()
                .message("Customer status updated successfully")
                .data(customerServices.updateStatusCustomerService(id, status))
                .build();
    }
    @GetMapping("/service/{serviceId}")
    ApiResponse<List<CustomerResponse>> getCustomerServicesByServiceId(@PathVariable String serviceId) {
        return ApiResponse.<List<CustomerResponse>>builder()
                .message("Customer services retrieved successfully")
                .data(customerServices.getCustomerServicesByServiceId(serviceId))
                .build();
    }
    @GetMapping
    ApiResponse<List<CustomerResponse>> getAllCustomerServices() {
        return ApiResponse.<List<CustomerResponse>>builder()
                .message("All customer services retrieved successfully")
                .data(customerServices.getAllCustomerServices())
                .build();
    }
    @GetMapping("/{id}")
    ApiResponse<CustomerDetailResponse> getCustomerServiceById(@PathVariable String id) {
        return ApiResponse.<CustomerDetailResponse>builder()
                .message("Customer service retrieved successfully")
                .data(customerServices.getCustomerServiceById(id))
                .build();
    }
}

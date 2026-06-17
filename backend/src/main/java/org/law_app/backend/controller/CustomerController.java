package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.ApiMeta;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.service.CustomerServices;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
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

  /** Republish all cases to RabbitMQ so the CRM service can backfill its read-replica. */
  @PostMapping("/crm/backfill")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  ApiResponse<Integer> backfillCrm() {
    return ApiResponse.<Integer>builder()
        .message("CRM backfill published")
        .data(customerServices.backfillCrm())
        .build();
  }

  @GetMapping("/service/{serviceId}")
  ApiResponse<List<CustomerResponse>> getCustomerServicesByServiceId(
      @PathVariable String serviceId,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<CustomerResponse> customers =
        customerServices.getCustomerServicesByServiceId(serviceId, pageable);
    return ApiResponse.<List<CustomerResponse>>builder()
        .message("Customer services retrieved successfully")
        .data(customers.getContent())
        .meta(ApiMeta.from(customers))
        .build();
  }

  @GetMapping
  ApiResponse<List<CustomerResponse>> getAllCustomerServices(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<CustomerResponse> customers = customerServices.getAllCustomerServices(pageable);
    return ApiResponse.<List<CustomerResponse>>builder()
        .message("All customer services retrieved successfully")
        .data(customers.getContent())
        .meta(ApiMeta.from(customers))
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

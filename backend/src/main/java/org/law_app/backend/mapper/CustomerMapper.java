package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Customer;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.entity.CustomerService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    default Customer toCustomer(CustomerRequest customerRequest) {
        return Customer.builder()
                .email(customerRequest.getEmail())
                .phone(customerRequest.getPhone())
                .build();
    }
    default CustomerService toCustomerService(CustomerRequest customerRequest, ChildrenServices service) {
        return CustomerService.builder()
                .customer(toCustomer(customerRequest))
                .name(customerRequest.getName())
                .description(customerRequest.getDescription())
                .service(service)
                .build();
    }
    default CustomerResponse toCustomerResponse(CustomerService customerService) {
        return CustomerResponse.builder()
                .id(customerService.getId())
                .name(customerService.getName())
                .serviceId(customerService.getService().getId())
                .serviceName(customerService.getService().getTitle())
                .status(customerService.getStatus())
                .createdAt(customerService.getCreatedAt())
                .email(customerService.getCustomer().getEmail())
                .phone(customerService.getCustomer().getPhone())
                .build();
    }
    default CustomerDetailResponse toCustomerDetailResponse(CustomerService customerService) {
        return CustomerDetailResponse.builder()
                .id(customerService.getId())
                .name(customerService.getName())
                .email(customerService.getCustomer().getEmail())
                .phone(customerService.getCustomer().getPhone())
                .description(customerService.getDescription())
                .serviceId(customerService.getService().getId())
                .serviceName(customerService.getService().getTitle())
                .status(customerService.getStatus())
                .createdAt(customerService.getCreatedAt())
                .updatedAt(customerService.getUpdatedAt() != null ? customerService.getUpdatedAt() : null)
                .completedAt(customerService.getCompletedAt() != null ? customerService.getCompletedAt() : null)
                .cancelledAt(customerService.getCanceledAt() != null ? customerService.getCanceledAt() : null)
                .build();
    }
}

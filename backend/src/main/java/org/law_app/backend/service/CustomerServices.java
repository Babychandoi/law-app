package org.law_app.backend.service;

import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.dto.response.CustomerDetailResponse;

import java.util.List;

public interface CustomerServices {
    Boolean createCustomerService(CustomerRequest customerRequest);
    Boolean updateStatusCustomerService(String id, Status status);
    List<CustomerResponse> getCustomerServicesByServiceId(String serviceId);
    List<CustomerResponse> getAllCustomerServices();
    CustomerDetailResponse getCustomerServiceById(String id);

}

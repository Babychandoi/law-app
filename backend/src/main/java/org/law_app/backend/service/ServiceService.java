package org.law_app.backend.service;

import org.law_app.backend.dto.request.PricingRequest;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ChildrenServiceResponse;
import org.law_app.backend.dto.response.PricingResponse;
import org.law_app.backend.dto.response.ServiceResponse;

import java.util.List;

public interface ServiceService {
    List<ServiceResponse> getServices();
    boolean createService(ServiceRequest serviceRequest);
    List<ChildrenServiceResponse> getChildrenServiceById(String id);
    List<PricingResponse> getPricingByServiceId(String serviceId);
    Boolean createPricingByServiceId(String serviceId, List<PricingRequest> pricingRequests);
}

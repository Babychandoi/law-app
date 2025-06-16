package org.law_app.backend.service;

import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ServiceResponse;

import java.util.List;

public interface ServiceService {
    List<ServiceResponse> getServices();
    boolean createService(ServiceRequest serviceRequest);
}

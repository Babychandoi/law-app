package org.law_app.backend.service.impl;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ServiceResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Services;
import org.law_app.backend.mapper.ServiceMapper;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.ServiceRepository;
import org.law_app.backend.service.ServiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class ServiceServiceImpl implements ServiceService {
    ServiceRepository serviceRepository;
    ChildrenServiceRepository childrenServiceRepository;
    ServiceMapper serviceMapper;
    @Override
    public List<ServiceResponse> getServices() {
        List<Services> services = serviceRepository.findAll();
        List<ServiceResponse> serviceResponses = new ArrayList<>();
        for(Services service : services) {
            List<ChildrenServices> childrenServices = childrenServiceRepository.findByParentService(service);
            List<ServiceResponse> childResponses = childrenServices.stream()
                    .map(serviceMapper::toChildServiceResponse)
                    .toList();
            ServiceResponse response = serviceMapper.toServiceResponse(service);
            response.setChildren(childResponses);
            serviceResponses.add(response);
        }
        return serviceResponses;
    }
    @Override
    @Transactional
    public boolean createService(ServiceRequest serviceRequest) {
        try {
            Services service = serviceMapper.toServices(serviceRequest);
            serviceRepository.save(service);
            for(ServiceRequest childService : serviceRequest.getChildren()) {
                ChildrenServices childrenService = serviceMapper.toChildrenServices(childService);
                childrenService.setParentService(service);
                childrenServiceRepository.save(childrenService);
            }
            return true;

        }catch (Exception e) {
            log.error("Error while creating service: {}", e.getMessage());
            throw e;
        }


    }
}

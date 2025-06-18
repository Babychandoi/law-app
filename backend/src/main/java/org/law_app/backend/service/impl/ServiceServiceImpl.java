package org.law_app.backend.service.impl;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.PricingRequest;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ChildrenServiceResponse;
import org.law_app.backend.dto.response.PricingResponse;
import org.law_app.backend.dto.response.ServiceResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Pricing;
import org.law_app.backend.entity.Services;
import org.law_app.backend.mapper.ServiceMapper;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.PricingRepository;
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
    PricingRepository pricingRepository;
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

    @Override
    public List<ChildrenServiceResponse> getChildrenServiceById(String id) {
        try{
         Services services = serviceRepository.findById(id).orElseThrow();
         List<ChildrenServices> childrenService = childrenServiceRepository.findByParentService(services);
            return childrenService.stream()
                    .map(serviceMapper::toChildrenServiceResponse)
                    .toList();
        }catch (Exception e) {
            log.error("Error while getting children service by id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PricingResponse> getPricingByServiceId(String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));
            List<Pricing> pricings = pricingRepository.findByService(childrenService);
            return pricings.stream()
                    .map(serviceMapper::toPricingResponse).toList();
        }catch (Exception e) {
            log.error("Error while getting pricing by service id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public Boolean createPricingByServiceId(String serviceId, List<PricingRequest> pricingRequests) {
        try{
               ChildrenServices services = childrenServiceRepository.findById(serviceId)
                       .orElseThrow(()-> new RuntimeException("Service not found with id: " + serviceId));
                for(PricingRequest pricingRequest : pricingRequests) {
                    Pricing pricing = serviceMapper.toPricing(pricingRequest);
                    pricing.setService(services);
                    pricingRepository.save(pricing);

                }
                return true;

            }catch (Exception e){
                log.error("Error pricing to service: {}", e.getMessage());
                throw  e;
            }
    }


}

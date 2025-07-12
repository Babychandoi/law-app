package org.law_app.backend.service.impl;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.PricingRequest;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.request.ToToRequest;
import org.law_app.backend.dto.response.*;
import org.law_app.backend.entity.*;
import org.law_app.backend.mapper.ServiceMapper;
import org.law_app.backend.repository.*;
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
    CompanyRepository companyRepository;
    LocationRepository locationRepository;
    SocialRepository socialRepository;
    PhoneContactRepository phoneContactRepository;
    ImportantRepository importantRepository;
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

    @Override
    public ToToResponse getToTo() {
        Company company = companyRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No company found"));
        return ToToResponse.builder()
                .company(serviceMapper.toCompanyResponse(company))
                .importants(company.getImportants().stream()
                        .map(serviceMapper::toImportantResponse)
                        .toList())
                .locations(company.getLocations().stream()
                        .map(serviceMapper::toLocationResponse)
                        .toList())
                .phoneContacts(company.getPhoneContacts().stream()
                        .map(serviceMapper::toPhoneContactResponse)
                        .toList())
                .socials(company.getSocials().stream()
                        .map(serviceMapper::toSocialResponse)
                        .toList())
                .build();
    }

    @Override
    @Transactional
    public boolean createToTo(ToToRequest toToRequest) {
        try {
            // Chuyển từ DTO sang entity
            Company company = serviceMapper.toCompany(toToRequest.getCompany());

            // Gán danh sách con sau khi ánh xạ và liên kết với company
            List<Important> importants = toToRequest.getImportants().stream()
                    .map(serviceMapper::toImportant)
                    .peek(important -> important.setCompany(company))
                    .toList();

            List<Location> locations = toToRequest.getLocations().stream()
                    .map(serviceMapper::toLocation)
                    .peek(location -> location.setCompany(company))
                    .toList();

            List<Social> socials = toToRequest.getSocials().stream()
                    .map(serviceMapper::toSocial)
                    .peek(social -> social.setCompany(company))
                    .toList();

            List<PhoneContact> phoneContacts = toToRequest.getPhoneContacts().stream()
                    .map(serviceMapper::toPhoneContact)
                    .peek(phone -> phone.setCompany(company))
                    .toList();

            // Gán lại vào entity cha
            company.setImportants(importants);
            company.setLocations(locations);
            company.setSocials(socials);
            company.setPhoneContacts(phoneContacts);

            // Lưu tất cả thông qua company (nếu CascadeType.ALL đúng trong entity Company)
            companyRepository.save(company);

            return true;

        } catch (Exception e) {
            log.error("Error while creating ToTo: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<ServicesHomeResponse> getServicesHome() {
        try {
            List<ChildrenServices> childrenServices = childrenServiceRepository.findAll();
            List<ServicesHomeResponse> servicesHomeResponses = new ArrayList<>();
            for(ChildrenServices childrenService : childrenServices) {
                if(childrenService.getDescriptionHome() !=null) {
                    ServicesHomeResponse response = serviceMapper.toServicesHomeResponse(childrenService);
                    servicesHomeResponses.add(response);
                }
            }
            return servicesHomeResponses;
        }catch (Exception e) {
            log.error("Error while getting services home: {}", e.getMessage());
            throw e;
        }
    }



}

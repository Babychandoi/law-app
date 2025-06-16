package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ServiceResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Services;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    default ServiceResponse toServiceResponse(Services services){
        return ServiceResponse.builder()
                .id(services.getId())
                .title(services.getTitle())
                .href(services.getHref())
                .build();
    }
    default ServiceResponse toChildServiceResponse(ChildrenServices services) {

        return ServiceResponse.builder()
                .id(services.getId())
                .title(services.getTitle())
                .href(services.getHref())
                .description(services.getDescription())
                .build();
    }
    default ChildrenServices toChildrenServices(ServiceRequest serviceRequest) {
        return ChildrenServices.builder()
                .title(serviceRequest.getTitle())
                .href(serviceRequest.getHref())
                .description(serviceRequest.getDescription())
                .build();
    }
    default Services toServices(ServiceRequest serviceRequest) {
        if (serviceRequest == null) {
            return null;
        }
        Services services = new Services();
        services.setTitle(serviceRequest.getTitle());
        services.setHref(serviceRequest.getHref());
        return services;
    }
}

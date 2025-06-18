package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.PricingRequest;
import org.law_app.backend.dto.request.ServiceRequest;
import org.law_app.backend.dto.response.ChildrenServiceResponse;
import org.law_app.backend.dto.response.PricingResponse;
import org.law_app.backend.dto.response.ServiceResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Pricing;
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
                .image(serviceRequest.getImage())
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
    default ChildrenServiceResponse toChildrenServiceResponse(ChildrenServices childrenServices) {

        return ChildrenServiceResponse.builder()
                .id(childrenServices.getId())
                .title(childrenServices.getTitle())
                .href(childrenServices.getHref())
                .description(childrenServices.getDescription())
                .image(childrenServices.getImage())
                .build();
    }
    default PricingResponse toPricingResponse(Pricing pricing) {
        return PricingResponse.builder()
                .id(pricing.getId())
                .title(pricing.getTitle())
                .description(pricing.getDescription() != null ? pricing.getDescription() : null)
                .price(pricing.getPrice())
                .image(pricing.getImage() != null ? pricing.getImage() : null)
                .currency(pricing.getCurrency())
                .features(pricing.getFeatures() != null ? pricing.getFeatures() : null)
                .featured(pricing.isFeatured())
                .build();
    }
    default Pricing toPricing(PricingRequest pricingResponse) {
       return Pricing.builder()
                .title(pricingResponse.getTitle())
                .description(pricingResponse.getDescription() == null ?  null : pricingResponse.getDescription())
                .price(pricingResponse.getPrice())
                .image(pricingResponse.getImage() != null ? pricingResponse.getImage() : null)
                .currency(pricingResponse.getCurrency())
                .features(pricingResponse.getFeatures() != null ? pricingResponse.getFeatures() : null)
                .featured(pricingResponse.isFeatured())
                .build();
    }
}

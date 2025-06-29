package org.law_app.backend.mapper;

import org.law_app.backend.common.Color;
import org.law_app.backend.dto.request.*;
import org.law_app.backend.dto.response.*;
import org.law_app.backend.entity.*;
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
    default CompanyResponse toCompanyResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .email(company.getEmail())
                .representative(company.getRepresentative())
                .taxCode(company.getTaxCode())
                .websiteName(company.getWebsiteName())
                .build();
    }
    default LocationResponse toLocationResponse(Location location) {
        return LocationResponse.builder()
                .id(location.getId())
                .type(location.getType())
                .address(location.getAddress())
                .color(location.getColor() != null ? location.getColor() : null)
                .build();
    }
    default ImportantResponse toImportantResponse(Important important) {
        return ImportantResponse.builder()
                .id(important.getId())
                .icon(important.getIcon() != null ? important.getIcon() : null)
                .text(important.getText())
                .href(important.getHref() != null ? important.getHref() : null)
                .color(important.getColor() != null ? important.getColor() : null)
                .build();
    }
    default PhoneContactResponse toPhoneContactResponse(PhoneContact phoneContact) {
        return PhoneContactResponse.builder()
                .id(phoneContact.getId())
                .label(phoneContact.getLabel())
                .number(phoneContact.getNumber())
                .color(phoneContact.getColor() != null ? phoneContact.getColor() : null)
                .build();
    }
    default SocialResponse toSocialResponse(Social social) {
        return SocialResponse.builder()
                .id(social.getId())
                .color(social.getColor() == Color.BLUE_600 ? "blue-600" : social.getColor() == Color.BLUE_700 ? "blue-700" : null)
                .label(social.getLabel())
                .icon(social.getIcon() != null ? social.getIcon() : null)
                .href(social.getHref() != null ? social.getHref() : null)
                .build();
    }
    default Social toSocial(SocialRequest socialRequest) {
        return Social.builder()
                .label(socialRequest.getLabel())
                .icon(socialRequest.getIcon() != null ? socialRequest.getIcon() : null)
                .href(socialRequest.getHref() != null ? socialRequest.getHref() : null)
                .color(socialRequest.getColor() != null ? socialRequest.getColor() : null)
                .build();
    }
    default PhoneContact toPhoneContact(PhoneContactRequest phoneContactRequest) {
        return PhoneContact.builder()
                .label(phoneContactRequest.getLabel())
                .number(phoneContactRequest.getNumber())
                .color(phoneContactRequest.getColor() != null ? phoneContactRequest.getColor() : null)
                .build();
    }
    default Company toCompany(CompanyRequest companyRequest) {
        return Company.builder()
                .name(companyRequest.getName())
                .representative(companyRequest.getRepresentative())
                .taxCode(companyRequest.getTaxCode())
                .websiteName(companyRequest.getWebsiteName())
                .email(companyRequest.getEmail())
                .build();
    }
    default Location toLocation(LocationRequest locationRequest) {
        return Location.builder()
                .type(locationRequest.getType())
                .address(locationRequest.getAddress())
                .color(locationRequest.getColor() != null ? locationRequest.getColor() : null)
                .build();
    }
    default Important toImportant(ImportantRequest importantRequest) {
        return Important.builder()
                .text(importantRequest.getText())
                .href(importantRequest.getHref() != null ? importantRequest.getHref() : null)
                .icon(importantRequest.getIcon() != null ? importantRequest.getIcon() : null)
                .color(importantRequest.getColor() != null ? importantRequest.getColor() : null)
                .build();
    }
}

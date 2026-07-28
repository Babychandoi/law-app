package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.request.PreviousPartnerRequest;
import org.law_app.backend.dto.request.ProcessRequest;
import org.law_app.backend.dto.request.ProcessTimeLineRequest;
import org.law_app.backend.dto.response.ChildrenServiceResponse;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.dto.response.PreviousPartnerResponse;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ProcessTimeLineResponse;

public interface ChildrenService {
  Boolean createHero(HeroRequest heroRequest, String serviceId);

  HeroResponse getHeroByServiceId(String serviceId);

  List<ProcessResponse> getProcessByServiceId(String serviceId);

  Boolean createProcess(String serviceId, List<ProcessRequest> processRequest);

  List<PreviousPartnerResponse> getPreviousPartners();

  Boolean createPreviousPartner(List<PreviousPartnerRequest> previousPartner);

  List<ProcessTimeLineResponse> getProcessTimeLineByServiceId(String serviceId);

  Boolean createProcessTimeLine(
      String serviceId, List<ProcessTimeLineRequest> processTimeLineRequest);

  List<ChildrenServiceResponse> getAllChildren();

  Boolean updateChildImage(String id, String imageUrl);

  // ===== CMS: quản lý dịch vụ hoàn toàn qua admin =====

  ChildrenServiceResponse createChild(
      org.law_app.backend.dto.request.ChildrenServiceRequest request);

  Boolean updateChild(String id, org.law_app.backend.dto.request.ChildrenServiceRequest request);

  Boolean deleteChild(String id);

  Boolean upsertHero(String serviceId, HeroRequest heroRequest);

  Boolean replaceProcess(String serviceId, List<ProcessRequest> processRequests);

  Boolean replacePricing(
      String serviceId, List<org.law_app.backend.dto.request.PricingRequest> pricingRequests);

  List<org.law_app.backend.dto.response.ServiceSectionResponse> getSections(String serviceId);

  Boolean replaceSections(
      String serviceId,
      List<org.law_app.backend.dto.request.ServiceSectionRequest> sectionRequests);

  org.law_app.backend.dto.response.ServicePageResponse getServicePage(String href);
}

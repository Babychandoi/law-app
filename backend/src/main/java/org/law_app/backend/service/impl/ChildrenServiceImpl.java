package org.law_app.backend.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.request.PreviousPartnerRequest;
import org.law_app.backend.dto.request.ProcessRequest;
import org.law_app.backend.dto.request.ProcessTimeLineRequest;
import org.law_app.backend.dto.response.ChildrenServiceResponse;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.dto.response.PreviousPartnerResponse;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ProcessTimeLineResponse;
import org.law_app.backend.entity.*;
import org.law_app.backend.entity.Process;
import org.law_app.backend.mapper.ChildrenMapper;
import org.law_app.backend.repository.*;
import org.law_app.backend.service.ChildrenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class ChildrenServiceImpl implements ChildrenService {
  ChildrenServiceRepository childrenServiceRepository;
  org.law_app.backend.service.MinioService minioService;
  org.law_app.backend.security.MinioConfig minioConfig;
  PricingRepository pricingRepository;
  ServiceSectionRepository serviceSectionRepository;
  ServiceRepository serviceRepository;
  org.law_app.backend.mapper.ServiceMapper serviceMapper;
  ProcessRepository processRepository;
  ProcessDetailRepository processDetailRepository;
  PreviousPartnerRepository previousPartnerRepository;
  ChildrenMapper childrenMapper;
  HeroRepository heroRepository;
  ProcessTimeLineRepository processTimeLineRepository;

  @Override
  @Transactional
  public Boolean createHero(HeroRequest heroRequest, String serviceId) {
    try {
      ChildrenServices childrenService =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      Hero hero =
          Hero.builder()
              .title(heroRequest.getTitle())
              .description(heroRequest.getDescription())
              .subtitle(heroRequest.getSubtitle())
              .service(childrenService)
              .build();
      heroRepository.save(hero);
      return true;
    } catch (Exception e) {
      log.error("Error creating hero: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public HeroResponse getHeroByServiceId(String serviceId) {
    try {
      ChildrenServices childrenService =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      Hero hero = heroRepository.findByService(childrenService);
      if (hero == null) {
        throw new IllegalArgumentException("Hero not found for service id: " + serviceId);
      }
      return HeroResponse.builder()
          .subtitle(hero.getSubtitle())
          .title(hero.getTitle())
          .description(hero.getDescription())
          .build();
    } catch (Exception e) {
      log.error("Error fetching hero by service id: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<ProcessResponse> getProcessByServiceId(String serviceId) {
    try {
      ChildrenServices childrenService =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      List<Process> process = processRepository.findByServiceOrderBySortOrderAsc(childrenService);
      return process.stream()
          .map(
              proc -> {
                List<ProcessDetail> processDetails = processDetailRepository.findByProcessOrderBySortOrderAsc(proc);
                return childrenMapper.toProcessResponse(proc, processDetails);
              })
          .toList();
    } catch (Exception e) {
      log.error("Error fetching process by service id: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  @Transactional
  public Boolean createProcess(String serviceId, List<ProcessRequest> processRequest) {
    try {
      ChildrenServices childrenService =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      int order = 0;
      for (ProcessRequest request : processRequest) {
        Process process = childrenMapper.toProcess(request, childrenService);
        process.setSortOrder(order++); // giữ đúng thứ tự các bước khi đọc lại
        processRepository.save(process);
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
          List<ProcessDetail> processDetails = childrenMapper.toProcessDetail(request, process);
          for (int d = 0; d < processDetails.size(); d++) {
            processDetails.get(d).setSortOrder(d); // giữ đúng thứ tự chi tiết trong bước
          }
          processDetailRepository.saveAll(processDetails);
        }
      }
      return true;
    } catch (Exception e) {
      log.error("Error creating process: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<PreviousPartnerResponse> getPreviousPartners() {
    try {
      List<PreviousPartner> previousPartners = previousPartnerRepository.findAll();
      return previousPartners.stream().map(childrenMapper::toPreviousPartnerResponse).toList();
    } catch (Exception e) {
      log.error("Error fetching previous partners: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public Boolean createPreviousPartner(List<PreviousPartnerRequest> previousPartner) {
    try {
      List<PreviousPartner> partners =
          previousPartner.stream().map(childrenMapper::toPreviousPartner).toList();
      previousPartnerRepository.saveAll(partners);
      return true;
    } catch (Exception e) {
      log.error("Error creating previous partners: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<ProcessTimeLineResponse> getProcessTimeLineByServiceId(String serviceId) {
    try {
      ChildrenServices childrenService =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      List<ProcessTimeLine> processTimeLines =
          processTimeLineRepository.findByService(childrenService);
      return processTimeLines.stream().map(childrenMapper::toProcessTimeLineResponse).toList();

    } catch (Exception e) {
      log.error("Error fetching process timeline by service id: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public Boolean createProcessTimeLine(
      String serviceId, List<ProcessTimeLineRequest> processTimeLineRequests) {
    try {
      ChildrenServices childrenServices =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with id: " + serviceId));
      for (ProcessTimeLineRequest processTimeLineRequest : processTimeLineRequests) {
        processTimeLineRepository.save(
            childrenMapper.toProcessTimeLine(processTimeLineRequest, childrenServices));
      }

      return true;
    } catch (Exception e) {
      log.error("");
      throw e;
    }
  }

  @Override
  public List<ChildrenServiceResponse> getAllChildren() {
    return childrenServiceRepository.findAll().stream()
        .map(
            c ->
                ChildrenServiceResponse.builder()
                    .id(c.getId())
                    .title(c.getTitle())
                    .href(c.getHref())
                    .description(c.getDescription())
                    // DB lưu tên file; ghép URL MinIO đầy đủ như các endpoint public
                    .image(
                        c.getImage() != null && !c.getImage().startsWith("http")
                            ? minioService.generateFileUrl(
                                minioConfig.getImagesBucket(), c.getImage())
                            : c.getImage())
                    .build())
        .toList();
  }

  @Override
  @Transactional
  public Boolean updateChildImage(String id, String imageUrl) {
    ChildrenServices child =
        childrenServiceRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + id));
    // DB chỉ lưu tên file trong bucket; nếu nhận URL đầy đủ thì rút về tên file
    String objectName = imageUrl;
    if (objectName != null && objectName.startsWith("http")) {
      objectName = objectName.substring(objectName.lastIndexOf('/') + 1);
    }
    child.setImage(objectName);
    childrenServiceRepository.save(child);
    return true;
  }

  // ===== CMS: quản lý dịch vụ hoàn toàn qua admin =====

  private String resolveImageUrl(String image) {
    if (image == null || image.isBlank() || image.startsWith("http") || image.startsWith("/")) {
      return image;
    }
    return minioService.generateFileUrl(minioConfig.getImagesBucket(), image);
  }

  private String toObjectName(String image) {
    if (image != null && image.startsWith("http")) {
      return image.substring(image.lastIndexOf('/') + 1);
    }
    return image;
  }

  private String normalizeHref(String href) {
    if (href == null || href.isBlank()) {
      throw new IllegalArgumentException("Đường dẫn trang (href) không được để trống");
    }
    String h = href.trim();
    if (!h.startsWith("/")) h = "/" + h;
    return h;
  }

  private ChildrenServices requireChild(String id) {
    return childrenServiceRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + id));
  }

  @Override
  @Transactional
  public ChildrenServiceResponse createChild(
      org.law_app.backend.dto.request.ChildrenServiceRequest request) {
    String href = normalizeHref(request.getHref());
    childrenServiceRepository
        .findByHref(href)
        .ifPresent(
            existing -> {
              throw new IllegalArgumentException("Đường dẫn " + href + " đã được dùng");
            });
    Services parent = null;
    if (request.getParentServiceId() != null && !request.getParentServiceId().isBlank()) {
      parent = serviceRepository.findById(request.getParentServiceId()).orElse(null);
    }
    ChildrenServices child =
        ChildrenServices.builder()
            .title(request.getTitle())
            .href(href)
            .description(request.getDescription())
            .icon(request.getIcon())
            .image(toObjectName(request.getImage()))
            .descriptionHome(request.getDescriptionHome())
            .parentService(parent)
            .build();
    child = childrenServiceRepository.save(child);
    return ChildrenServiceResponse.builder()
        .id(child.getId())
        .title(child.getTitle())
        .href(child.getHref())
        .description(child.getDescription())
        .image(resolveImageUrl(child.getImage()))
        .build();
  }

  @Override
  @Transactional
  public Boolean updateChild(
      String id, org.law_app.backend.dto.request.ChildrenServiceRequest request) {
    ChildrenServices child = requireChild(id);
    String href = normalizeHref(request.getHref());
    childrenServiceRepository
        .findByHref(href)
        .filter(other -> !other.getId().equals(id))
        .ifPresent(
            other -> {
              throw new IllegalArgumentException("Đường dẫn " + href + " đã được dùng");
            });
    child.setTitle(request.getTitle());
    child.setHref(href);
    child.setDescription(request.getDescription());
    child.setIcon(request.getIcon());
    if (request.getImage() != null) child.setImage(toObjectName(request.getImage()));
    child.setDescriptionHome(request.getDescriptionHome());
    if (request.getParentServiceId() != null && !request.getParentServiceId().isBlank()) {
      serviceRepository.findById(request.getParentServiceId()).ifPresent(child::setParentService);
    }
    childrenServiceRepository.save(child);
    return true;
  }

  @Override
  @Transactional
  public Boolean deleteChild(String id) {
    ChildrenServices child = requireChild(id);
    Hero hero = heroRepository.findByService(child);
    if (hero != null) heroRepository.delete(hero);
    for (Process p : processRepository.findByService(child)) {
      processDetailRepository.deleteByProcess(p);
      processRepository.delete(p);
    }
    pricingRepository.deleteByService(child);
    serviceSectionRepository.deleteByService(child);
    processTimeLineRepository.deleteAll(processTimeLineRepository.findByService(child));
    childrenServiceRepository.delete(child);
    return true;
  }

  @Override
  @Transactional
  public Boolean upsertHero(String serviceId, HeroRequest heroRequest) {
    ChildrenServices child = requireChild(serviceId);
    Hero hero = heroRepository.findByService(child);
    if (hero == null) {
      hero = Hero.builder().service(child).build();
    }
    hero.setTitle(heroRequest.getTitle());
    hero.setSubtitle(heroRequest.getSubtitle());
    hero.setDescription(heroRequest.getDescription());
    heroRepository.save(hero);
    return true;
  }

  @Override
  @Transactional
  public Boolean replaceProcess(String serviceId, List<ProcessRequest> processRequests) {
    ChildrenServices child = requireChild(serviceId);
    for (Process p : processRepository.findByService(child)) {
      processDetailRepository.deleteByProcess(p);
      processRepository.delete(p);
    }
    return createProcess(serviceId, processRequests == null ? List.of() : processRequests);
  }

  @Override
  @Transactional
  public Boolean replacePricing(
      String serviceId, List<org.law_app.backend.dto.request.PricingRequest> pricingRequests) {
    ChildrenServices child = requireChild(serviceId);
    pricingRepository.deleteByService(child);
    if (pricingRequests != null) {
      int order = 0;
      for (org.law_app.backend.dto.request.PricingRequest req : pricingRequests) {
        Pricing pricing = serviceMapper.toPricing(req);
        pricing.setService(child);
        pricing.setImage(toObjectName(pricing.getImage()));
        pricing.setSortOrder(order++); // giữ đúng thứ tự các gói khi đọc lại
        pricingRepository.save(pricing);
      }
    }
    return true;
  }

  @Override
  public List<org.law_app.backend.dto.response.ServiceSectionResponse> getSections(
      String serviceId) {
    ChildrenServices child = requireChild(serviceId);
    return serviceSectionRepository.findByServiceOrderBySortOrderAsc(child).stream()
        .map(this::toSectionResponse)
        .toList();
  }

  private org.law_app.backend.dto.response.ServiceSectionResponse toSectionResponse(
      ServiceSection s) {
    return org.law_app.backend.dto.response.ServiceSectionResponse.builder()
        .id(s.getId())
        .type(s.getType())
        .title(s.getTitle())
        .subtitle(s.getSubtitle())
        .content(s.getContent())
        .image(resolveImageUrl(s.getImage()))
        .sortOrder(s.getSortOrder())
        .items(
            s.getItems().stream()
                .map(
                    i ->
                        org.law_app.backend.dto.response.ServiceSectionResponse.Item.builder()
                            .id(i.getId())
                            .title(i.getTitle())
                            .description(i.getDescription())
                            .secondary(i.getSecondary())
                            .icon(i.getIcon())
                            .image(resolveImageUrl(i.getImage()))
                            .sortOrder(i.getSortOrder())
                            .build())
                .toList())
        .build();
  }

  @Override
  @Transactional
  public Boolean replaceSections(
      String serviceId,
      List<org.law_app.backend.dto.request.ServiceSectionRequest> sectionRequests) {
    ChildrenServices child = requireChild(serviceId);
    serviceSectionRepository.deleteByService(child);
    if (sectionRequests == null) return true;
    int order = 0;
    for (org.law_app.backend.dto.request.ServiceSectionRequest req : sectionRequests) {
      ServiceSection section =
          ServiceSection.builder()
              .type(req.getType())
              .title(req.getTitle())
              .subtitle(req.getSubtitle())
              .content(req.getContent())
              .image(toObjectName(req.getImage()))
              .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : order)
              .service(child)
              .build();
      order++;
      if (req.getItems() != null) {
        int itemOrder = 0;
        for (org.law_app.backend.dto.request.ServiceSectionRequest.Item item : req.getItems()) {
          section
              .getItems()
              .add(
                  ServiceSectionItem.builder()
                      .title(item.getTitle())
                      .description(item.getDescription())
                      .secondary(item.getSecondary())
                      .icon(item.getIcon())
                      .image(toObjectName(item.getImage()))
                      .sortOrder(item.getSortOrder() != null ? item.getSortOrder() : itemOrder)
                      .section(section)
                      .build());
          itemOrder++;
        }
      }
      serviceSectionRepository.save(section);
    }
    return true;
  }

  @Override
  public org.law_app.backend.dto.response.ServicePageResponse getServicePage(String href) {
    ChildrenServices child =
        childrenServiceRepository
            .findByHref(normalizeHref(href))
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trang: " + href));

    Hero hero = heroRepository.findByService(child);
    HeroResponse heroResponse =
        hero == null
            ? null
            : HeroResponse.builder()
                .title(hero.getTitle())
                .subtitle(hero.getSubtitle())
                .description(hero.getDescription())
                .build();

    List<ProcessResponse> process =
        processRepository.findByServiceOrderBySortOrderAsc(child).stream()
            .map(p -> childrenMapper.toProcessResponse(p, processDetailRepository.findByProcessOrderBySortOrderAsc(p)))
            .toList();

    List<org.law_app.backend.dto.response.PricingResponse> pricing =
        pricingRepository.findByServiceOrderBySortOrderAsc(child).stream()
            .map(
                p -> {
                  org.law_app.backend.dto.response.PricingResponse r =
                      serviceMapper.toPricingResponse(p);
                  r.setImage(resolveImageUrl(r.getImage()));
                  return r;
                })
            .toList();

    List<org.law_app.backend.dto.response.ServiceSectionResponse> sections =
        serviceSectionRepository.findByServiceOrderBySortOrderAsc(child).stream()
            .map(this::toSectionResponse)
            .toList();

    return org.law_app.backend.dto.response.ServicePageResponse.builder()
        .id(child.getId())
        .title(child.getTitle())
        .href(child.getHref())
        .description(child.getDescription())
        .image(resolveImageUrl(child.getImage()))
        .hero(heroResponse)
        .sections(sections)
        .process(process)
        .pricing(pricing)
        .build();
  }
}

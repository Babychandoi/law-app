package org.law_app.backend.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.LandingPageRequest;
import org.law_app.backend.dto.response.LandingPageResponse;
import org.law_app.backend.dto.response.LandingPageViewResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.LandingPage;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.LandingPageRepository;
import org.law_app.backend.service.ChildrenService;
import org.law_app.backend.service.LandingPageProvisioner;
import org.law_app.backend.service.LandingPageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandingPageServiceImpl implements LandingPageService {

  private final LandingPageRepository landingPageRepository;
  private final ChildrenServiceRepository childrenServiceRepository;
  private final ChildrenService childrenService;
  private final LandingPageProvisioner provisioner;

  @Override
  @Transactional(readOnly = true)
  public Optional<LandingPageViewResponse> getPublishedBySlug(String slug) {
    return landingPageRepository
        .findBySlug(LandingPageProvisioner.slugify(slug))
        .filter(LandingPage::isPublished)
        .map(
            landing ->
                LandingPageViewResponse.builder()
                    .landing(toResponse(landing))
                    .page(childrenService.getServicePage(landing.getService().getHref()))
                    .build());
  }

  @Override
  @Transactional(readOnly = true)
  public List<LandingPageResponse> getAll() {
    return landingPageRepository.findAllWithService().stream().map(this::toResponse).toList();
  }

  @Override
  @Transactional
  public LandingPageResponse create(LandingPageRequest request) {
    if (request.getServiceId() == null || request.getServiceId().isBlank()) {
      throw new IllegalArgumentException("Vui lòng chọn dịch vụ cho landing page");
    }
    ChildrenServices service =
        childrenServiceRepository
            .findById(request.getServiceId())
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Không tìm thấy dịch vụ: " + request.getServiceId()));
    landingPageRepository
        .findByService(service)
        .ifPresent(
            existing -> {
              throw new IllegalArgumentException(
                  "Dịch vụ \""
                      + service.getTitle()
                      + "\" đã có landing page (/lp/"
                      + existing.getSlug()
                      + ")");
            });

    String slug =
        request.getSlug() == null || request.getSlug().isBlank()
            ? provisioner.uniqueSlugFromHref(service.getHref())
            : requireFreeSlug(request.getSlug(), null);

    LandingPage landing = LandingPage.builder().service(service).slug(slug).build();
    applyEditableFields(landing, request);
    return toResponse(landingPageRepository.save(landing));
  }

  @Override
  @Transactional
  public LandingPageResponse update(String id, LandingPageRequest request) {
    LandingPage landing =
        landingPageRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy landing page: " + id));
    if (request.getSlug() != null && !request.getSlug().isBlank()) {
      landing.setSlug(requireFreeSlug(request.getSlug(), landing.getId()));
    }
    applyEditableFields(landing, request);
    return toResponse(landingPageRepository.save(landing));
  }

  @Override
  @Transactional
  public Boolean delete(String id) {
    LandingPage landing =
        landingPageRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy landing page: " + id));
    landingPageRepository.delete(landing);
    return true;
  }

  /** Slug là địa chỉ đang chạy ads — đổi trùng sẽ cướp traffic của landing khác, nên chặn thẳng. */
  private String requireFreeSlug(String raw, String selfId) {
    String slug = LandingPageProvisioner.slugify(raw);
    if (slug.isBlank()) {
      throw new IllegalArgumentException("Đường dẫn landing không hợp lệ");
    }
    landingPageRepository
        .findBySlug(slug)
        .filter(other -> !other.getId().equals(selfId))
        .ifPresent(
            other -> {
              throw new IllegalArgumentException("Đường dẫn /lp/" + slug + " đã được dùng");
            });
    return slug;
  }

  private void applyEditableFields(LandingPage landing, LandingPageRequest request) {
    if (request.getPublished() != null) landing.setPublished(request.getPublished());
    if (request.getEyebrow() != null) landing.setEyebrow(request.getEyebrow().trim());
    if (request.getHeroPoints() != null) {
      List<String> points =
          request.getHeroPoints().stream()
              .filter(p -> p != null && !p.isBlank())
              .map(String::trim)
              .toList();
      landing.setHeroPoints(new ArrayList<>(points));
    }
    if (request.getFormTitle() != null) landing.setFormTitle(request.getFormTitle().trim());
    if (request.getFormSubtitle() != null) {
      landing.setFormSubtitle(request.getFormSubtitle().trim());
    }
    if (request.getFinalCtaTitle() != null) {
      landing.setFinalCtaTitle(request.getFinalCtaTitle().trim());
    }
    if (request.getFinalCtaSubtitle() != null) {
      landing.setFinalCtaSubtitle(request.getFinalCtaSubtitle().trim());
    }
  }

  private LandingPageResponse toResponse(LandingPage landing) {
    ChildrenServices service = landing.getService();
    return LandingPageResponse.builder()
        .id(landing.getId())
        .slug(landing.getSlug())
        .published(landing.isPublished())
        .serviceId(service.getId())
        .serviceTitle(service.getTitle())
        .serviceHref(service.getHref())
        .eyebrow(landing.getEyebrow())
        .heroPoints(landing.getHeroPoints())
        .formTitle(landing.getFormTitle())
        .formSubtitle(landing.getFormSubtitle())
        .finalCtaTitle(landing.getFinalCtaTitle())
        .finalCtaSubtitle(landing.getFinalCtaSubtitle())
        .updatedAt(landing.getUpdatedAt())
        .build();
  }
}

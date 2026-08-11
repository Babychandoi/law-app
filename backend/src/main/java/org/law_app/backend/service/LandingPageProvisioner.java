package org.law_app.backend.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.LandingPage;
import org.law_app.backend.repository.LandingPageRepository;
import org.springframework.stereotype.Component;

/**
 * Sinh và gỡ landing page theo vòng đời của dịch vụ con.
 *
 * <p>Tách khỏi {@link LandingPageService} vì lớp đó cần {@code ChildrenService} để đọc nội dung
 * trang; nếu {@code ChildrenServiceImpl} gọi ngược lại sẽ thành phụ thuộc vòng. Lớp này chỉ đụng
 * repository nên an toàn cho cả hai chiều.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LandingPageProvisioner {

  private final LandingPageRepository landingPageRepository;

  /** Gạch đầu dòng mặc định — cam kết chung, áp cho mọi landing mới sinh. */
  private static final List<String> DEFAULT_HERO_POINTS =
      List.of(
          "Phản hồi trong vòng 24 giờ làm việc",
          "Báo phí trọn gói, rõ ràng trước khi triển khai",
          "Luật sư phụ trách trực tiếp, không qua trung gian");

  /**
   * Tạo landing nháp cho dịch vụ vừa thêm. Nuốt lỗi có chủ đích: landing là phụ trợ marketing, hỏng
   * bước này không được làm hỏng việc tạo dịch vụ.
   */
  public void createDraftFor(ChildrenServices service) {
    try {
      if (landingPageRepository.findByService(service).isPresent()) return;
      landingPageRepository.save(
          LandingPage.builder()
              .service(service)
              .slug(uniqueSlugFromHref(service.getHref()))
              .published(false)
              .eyebrow(service.getTitle())
              .heroPoints(new java.util.ArrayList<>(DEFAULT_HERO_POINTS))
              .formTitle("Nhận tư vấn miễn phí")
              .formSubtitle("Điền thông tin, luật sư sẽ gọi lại cho bạn.")
              .finalCtaTitle("Nhận tư vấn " + lowerFirst(service.getTitle()) + " miễn phí")
              .finalCtaSubtitle("Để lại thông tin, luật sư sẽ tư vấn và báo phí trọn gói cho bạn.")
              .build());
    } catch (Exception e) {
      log.error("Không sinh được landing nháp cho dịch vụ {}: {}", service.getId(), e.getMessage());
    }
  }

  public void deleteFor(ChildrenServices service) {
    landingPageRepository.deleteByService(service);
  }

  /** Slug từ href dịch vụ ("/dang-ky-nhan-hieu" -> "dang-ky-nhan-hieu"), thêm hậu tố nếu trùng. */
  public String uniqueSlugFromHref(String href) {
    String base = slugify(href);
    if (base.isBlank()) base = "landing";
    String candidate = base;
    for (int i = 2; landingPageRepository.existsBySlug(candidate); i++) {
      candidate = base + "-" + i;
    }
    return candidate;
  }

  /** Chuẩn hóa slug do admin nhập: bỏ dấu, bỏ "/" và "/lp/" nếu người dùng dán cả đường dẫn. */
  public static String slugify(String raw) {
    if (raw == null) return "";
    String value = raw.trim().toLowerCase(Locale.ROOT);
    if (value.startsWith("/lp/")) value = value.substring(4);
    value = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    value = value.replace('đ', 'd');
    value = value.replaceAll("[^a-z0-9/-]+", "-");
    value = value.replace('/', '-');
    return value.replaceAll("-{2,}", "-").replaceAll("(^-)|(-$)", "");
  }

  private static String lowerFirst(String value) {
    if (value == null || value.isBlank()) return "dịch vụ";
    return Character.toLowerCase(value.charAt(0)) + value.substring(1);
  }
}

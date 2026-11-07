package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.LandingPageResponse;
import org.law_app.backend.dto.response.LandingPageViewResponse;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ServicePageResponse;
import org.law_app.backend.dto.response.ServiceSectionResponse;
import org.law_app.backend.entity.Job;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.JobRepository;
import org.law_app.backend.seo.CrawlerHtml;
import org.law_app.backend.service.LandingPageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** HTML văn bản thuần cho LANDING PAGE và TUYỂN DỤNG, dành cho trình quét. */
@RestController
@RequestMapping("/og")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class LandingJobOgController {

  LandingPageService landingPageService;
  JobRepository jobRepository;
  ChildrenServiceRepository childrenServiceRepository;

  /**
   * Landing page chạy ads.
   *
   * <p>Phải khớp đúng những gì LandingPage.tsx hiển thị: hero riêng của landing, các khối nội dung
   * và quy trình của dịch vụ, rồi lời kêu gọi cuối trang.
   *
   * <p>CỐ Ý bỏ bảng giá. Landing render ServicePageView với hidePricing nên người dùng không thấy
   * giá; đưa giá vào bản cho bot là tạo ra nội dung mà người thật không có — đúng định nghĩa
   * cloaking.
   */
  @GetMapping(value = "/landing/{slug}", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String landing(@PathVariable String slug) {
    String url = CrawlerHtml.SITE + "/lp/" + slug;
    LandingPageViewResponse view = landingPageService.getPublishedBySlug(slug).orElse(null);
    if (view == null) {
      return CrawlerHtml.head(
              "Không tìm thấy trang — Luật POIP Legal",
              "",
              OgController.DEFAULT_IMAGE,
              url,
              "website")
          + CrawlerHtml.nav(serviceLinks())
          + CrawlerHtml.footer();
    }
    LandingPageResponse lp = view.getLanding();
    ServicePageResponse page = view.getPage();

    String heroTitle =
        page.getHero() != null && page.getHero().getTitle() != null
            ? page.getHero().getTitle()
            : page.getTitle();
    String heroDesc =
        page.getHero() != null && page.getHero().getDescription() != null
            ? page.getHero().getDescription()
            : page.getDescription();

    StringBuilder b = new StringBuilder();
    b.append("<article>\n");
    if (lp.getEyebrow() != null && !lp.getEyebrow().isBlank()) {
      b.append("<p>").append(CrawlerHtml.esc(lp.getEyebrow())).append("</p>\n");
    }
    b.append("<h1>").append(CrawlerHtml.esc(heroTitle)).append("</h1>\n");
    appendText(b, heroDesc);
    if (lp.getHeroPoints() != null && !lp.getHeroPoints().isEmpty()) {
      b.append("<ul>\n");
      for (String p : lp.getHeroPoints()) {
        b.append("<li>").append(CrawlerHtml.esc(p)).append("</li>\n");
      }
      b.append("</ul>\n");
    }
    appendSections(b, page);
    appendProcess(b, page);
    if (lp.getFinalCtaTitle() != null && !lp.getFinalCtaTitle().isBlank()) {
      b.append("<h2>").append(CrawlerHtml.esc(lp.getFinalCtaTitle())).append("</h2>\n");
    }
    appendText(b, lp.getFinalCtaSubtitle());
    b.append("</article>\n");

    String title = lp.getEyebrow() != null ? lp.getEyebrow() : lp.getServiceTitle();
    return CrawlerHtml.head(
            title + " | Luật POIP Legal",
            heroDesc != null ? heroDesc : lp.getServiceTitle(),
            page.getImage() != null && !page.getImage().isBlank()
                ? page.getImage()
                : OgController.DEFAULT_IMAGE,
            url,
            "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  /** Danh sách vị trí tuyển dụng. */
  @GetMapping(value = "/jobs", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String jobs() {
    StringBuilder b = new StringBuilder();
    b.append("<h1>Tuyển dụng tại Luật POIP Legal</h1>\n<ul>\n");
    for (Job j : jobRepository.findAll()) {
      b.append("<li><a href=\"")
          .append(CrawlerHtml.esc(CrawlerHtml.SITE + "/tuyen-dung/vi-tri/" + j.getId()))
          .append("\">")
          .append(CrawlerHtml.esc(j.getTitle()))
          .append("</a> — ")
          .append(CrawlerHtml.esc(j.getLocation()))
          .append(" — ")
          .append(CrawlerHtml.esc(j.getJobType()))
          .append("</li>\n");
    }
    b.append("</ul>\n");
    return CrawlerHtml.head(
            "Tuyển dụng — Luật POIP Legal",
            "Các vị trí đang tuyển tại Công ty TNHH POIP Legal.",
            OgController.DEFAULT_IMAGE,
            CrawlerHtml.SITE + "/tuyen-dung",
            "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  /** Chi tiết một vị trí tuyển dụng. */
  @GetMapping(value = "/job/{id}", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String job(@PathVariable String id) {
    String url = CrawlerHtml.SITE + "/tuyen-dung/vi-tri/" + id;
    Job j = jobRepository.findById(id).orElse(null);
    if (j == null) {
      return CrawlerHtml.head(
              "Không tìm thấy vị trí — Luật POIP Legal",
              "",
              OgController.DEFAULT_IMAGE,
              url,
              "website")
          + CrawlerHtml.nav(serviceLinks())
          + CrawlerHtml.footer();
    }
    StringBuilder b = new StringBuilder();
    b.append("<article>\n<h1>").append(CrawlerHtml.esc(j.getTitle())).append("</h1>\n");
    b.append("<p>")
        .append(CrawlerHtml.esc(j.getLocation()))
        .append(" — ")
        .append(CrawlerHtml.esc(j.getJobType()))
        .append(" — ")
        .append(CrawlerHtml.esc(j.getCategory()))
        .append("</p>\n");
    b.append("<h2>Mô tả công việc</h2>\n");
    appendHtml(b, j.getDescription());
    b.append("<h2>Yêu cầu</h2>\n");
    appendHtml(b, j.getRequirements());
    b.append("<h2>Quyền lợi</h2>\n");
    appendHtml(b, j.getBenefits());
    b.append("</article>\n");
    return CrawlerHtml.head(
            j.getTitle() + " — Tuyển dụng — Luật POIP Legal",
            j.getLocation() + " — " + j.getJobType(),
            OgController.DEFAULT_IMAGE,
            url,
            "article")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  private void appendSections(StringBuilder b, ServicePageResponse page) {
    if (page.getSections() == null) return;
    for (ServiceSectionResponse s : page.getSections()) {
      if (s.getTitle() != null && !s.getTitle().isBlank()) {
        b.append("<h2>").append(CrawlerHtml.esc(s.getTitle())).append("</h2>\n");
      }
      appendText(b, s.getSubtitle());
      appendHtml(b, s.getContent());
      if (s.getItems() == null) continue;
      for (ServiceSectionResponse.Item it : s.getItems()) {
        if (it.getTitle() != null && !it.getTitle().isBlank()) {
          b.append("<h3>").append(CrawlerHtml.esc(it.getTitle())).append("</h3>\n");
        }
        appendHtml(b, it.getDescription());
        appendHtml(b, it.getSecondary());
      }
    }
  }

  private void appendProcess(StringBuilder b, ServicePageResponse page) {
    if (page.getProcess() == null || page.getProcess().isEmpty()) return;
    b.append("<h2>Quy trình thực hiện</h2>\n<ol>\n");
    for (ProcessResponse p : page.getProcess()) {
      b.append("<li>");
      if (p.getTitle() != null) {
        b.append(CrawlerHtml.esc(p.getTitle()));
      }
      if (p.getDescription() != null && !p.getDescription().isBlank()) {
        b.append(" — ").append(CrawlerHtml.esc(p.getDescription()));
      }
      b.append("</li>\n");
    }
    b.append("</ol>\n");
  }

  private void appendText(StringBuilder b, String v) {
    if (v == null || v.isBlank()) return;
    b.append("<p>").append(CrawlerHtml.esc(v)).append("</p>\n");
  }

  private void appendHtml(StringBuilder b, String v) {
    if (v == null || v.isBlank()) return;
    for (String p : CrawlerHtml.htmlToParagraphs(v)) {
      b.append("<p>").append(CrawlerHtml.esc(p)).append("</p>\n");
    }
  }

  private List<String[]> serviceLinks() {
    return childrenServiceRepository.findAll().stream()
        .filter(c -> c.getHref() != null && !c.getHref().isBlank())
        .map(c -> new String[] {c.getHref(), c.getTitle() == null ? c.getHref() : c.getTitle()})
        .toList();
  }
}

package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ServicePageResponse;
import org.law_app.backend.dto.response.ServiceSectionResponse;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.seo.CrawlerHtml;
import org.law_app.backend.service.ChildrenService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTML văn bản thuần của TRANG DỊCH VỤ cho trình quét, dựng từ đúng ServicePageResponse mà SPA dùng
 * để render — nên nội dung hai bên tương đương, không phải cloaking.
 *
 * <p>nginx dò User-Agent bot ở /{slug} rồi proxy sang đây; người dùng thật vẫn nhận SPA.
 */
@Slf4j
@RestController
@RequestMapping("/og")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ServiceOgController {

  ChildrenService childrenService;
  ChildrenServiceRepository childrenServiceRepository;

  @GetMapping(value = "/service/{slug}", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String serviceOg(@PathVariable String slug) {
    String href = "/" + slug;
    String url = CrawlerHtml.SITE + href;
    ServicePageResponse page;
    try {
      page = childrenService.getServicePage(href);
    } catch (Exception e) {
      // Không phải trang dịch vụ: vẫn trả trang hợp lệ có điều hướng, tránh ngõ cụt cho bot.
      return CrawlerHtml.head(
              "Luật POIP Legal",
              "Dịch vụ sở hữu trí tuệ và pháp lý doanh nghiệp.",
              OgController.DEFAULT_IMAGE,
              url,
              "website")
          + CrawlerHtml.nav(serviceLinks())
          + CrawlerHtml.footer();
    }

    // H1 phải khớp CHÍNH XÁC những gì người dùng thấy. ServicePageView render
    // HeroService với title={hero?.title || data.title}; nếu ở đây chỉ dùng page.title thì bot
    // nhận tiêu đề khác người dùng — vừa mất từ khoá, vừa là chênh lệch dễ bị coi là cloaking.
    String heroTitle = page.getHero() != null ? page.getHero().getTitle() : null;
    String title =
        heroTitle != null && !heroTitle.isBlank()
            ? heroTitle
            : (page.getTitle() == null ? "Luật POIP Legal" : page.getTitle());
    String desc =
        page.getDescription() != null && !page.getDescription().isBlank()
            ? page.getDescription()
            : (page.getHero() != null && page.getHero().getDescription() != null
                ? page.getHero().getDescription()
                : title);
    String image =
        page.getImage() != null && !page.getImage().isBlank()
            ? page.getImage()
            : OgController.DEFAULT_IMAGE;

    StringBuilder b = new StringBuilder();
    b.append("<article>\n<h1>").append(CrawlerHtml.esc(title)).append("</h1>\n");

    // Theo dung thu tu SPA hien thi: subtitle cua hero, roi mo ta (hero uu tien hon page).
    if (page.getHero() != null) {
      appendText(b, page.getHero().getSubtitle());
    }
    String heroDesc = page.getHero() != null ? page.getHero().getDescription() : null;
    appendText(b, heroDesc != null && !heroDesc.isBlank() ? heroDesc : page.getDescription());

    // Các khối nội dung do admin nhập: tiêu đề, mô tả và từng mục con.
    if (page.getSections() != null) {
      for (ServiceSectionResponse s : page.getSections()) {
        if (s.getTitle() != null && !s.getTitle().isBlank()) {
          b.append("<h2>").append(CrawlerHtml.esc(s.getTitle())).append("</h2>\n");
        }
        appendText(b, s.getSubtitle());
        appendHtml(b, s.getContent());
        if (s.getItems() != null) {
          for (ServiceSectionResponse.Item it : s.getItems()) {
            if (it.getTitle() != null && !it.getTitle().isBlank()) {
              b.append("<h3>").append(CrawlerHtml.esc(it.getTitle())).append("</h3>\n");
            }
            appendHtml(b, it.getDescription());
            appendHtml(b, it.getSecondary());
          }
        }
      }
    }

    // Quy trình thực hiện
    if (page.getProcess() != null && !page.getProcess().isEmpty()) {
      b.append("<h2>Quy trình thực hiện</h2>\n<ol>\n");
      for (ProcessResponse p : page.getProcess()) {
        b.append("<li>");
        if (p.getTitle() != null) b.append(CrawlerHtml.esc(p.getTitle()));
        if (p.getDescription() != null && !p.getDescription().isBlank()) {
          b.append(" — ").append(CrawlerHtml.esc(p.getDescription()));
        }
        b.append("</li>\n");
      }
      b.append("</ol>\n");
    }
    b.append("</article>\n");

    return CrawlerHtml.head(title + " — Luật POIP Legal", desc, image, url, "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  /** Chuỗi thuần: chỉ escape rồi bọc đoạn. */
  private void appendText(StringBuilder b, String value) {
    if (value == null || value.isBlank()) return;
    b.append("<p>").append(CrawlerHtml.esc(value)).append("</p>\n");
  }

  /** Chuỗi có thể chứa HTML của trình soạn thảo: rút thành văn bản thuần trước. */
  private void appendHtml(StringBuilder b, String value) {
    if (value == null || value.isBlank()) return;
    for (String p : CrawlerHtml.htmlToParagraphs(value)) {
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

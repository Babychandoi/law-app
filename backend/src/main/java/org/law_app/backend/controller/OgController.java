package org.law_app.backend.controller;

import java.text.SimpleDateFormat;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.seo.CrawlerHtml;
import org.law_app.backend.service.NewsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Trả HTML văn bản thuần cho TRÌNH QUÉT. nginx của frontend dò User-Agent bot rồi proxy sang đây;
 * người dùng thật vẫn nhận SPA bình thường.
 *
 * <p>Trước đây chỉ trả vài thẻ Open Graph kèm tiêu đề và phụ đề. Vì danh sách bot trong nginx có cả
 * Googlebot, hệ quả là Google index mọi bài viết dưới dạng mẩu cụt hai câu — đo được trên
 * production: Googlebot nhận 3.571 byte và nội dung dừng ở phụ đề, KHÔNG có thân bài.
 *
 * <p>Nay trả đủ thân bài (rút thành văn bản thuần) cộng khối điều hướng, nên trình quét vừa đọc
 * được nội dung vừa có đường đi tiếp sang trang khác.
 */
@RestController
@RequestMapping("/og")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class OgController {

  NewsService newsService;
  ChildrenServiceRepository childrenServiceRepository;

  static final String DEFAULT_IMAGE = CrawlerHtml.SITE + "/assets/images/og-logo.png";

  @GetMapping(value = "/news/{slug}", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String newsOg(@PathVariable String slug) {
    String url = CrawlerHtml.SITE + "/tin-tuc/" + slug;
    NewsResponse n;
    try {
      n = newsService.getNewsById(slug);
    } catch (Exception e) {
      // Không tìm thấy bài: vẫn trả trang hợp lệ có điều hướng để bot không đi vào ngõ cụt.
      return CrawlerHtml.head(
              "Luật POIP Legal — Tư vấn sở hữu trí tuệ & pháp lý doanh nghiệp",
              "Tư vấn và đăng ký nhãn hiệu, bản quyền, kiểu dáng, giấy phép doanh nghiệp.",
              DEFAULT_IMAGE,
              url,
              "website")
          + CrawlerHtml.nav(serviceLinks())
          + CrawlerHtml.footer();
    }

    String title = n.getTitle() != null ? n.getTitle() : "Luật POIP Legal";
    String desc = n.getSubtitle() != null ? n.getSubtitle() : "";
    String image = n.getImage() != null && !n.getImage().isBlank() ? n.getImage() : DEFAULT_IMAGE;

    StringBuilder body = new StringBuilder();
    body.append("<article>\n<h1>").append(CrawlerHtml.esc(title)).append("</h1>\n");
    if (!desc.isBlank()) {
      body.append("<p>").append(CrawlerHtml.esc(desc)).append("</p>\n");
    }
    if (n.getAuthor() != null && !n.getAuthor().isBlank()) {
      body.append("<p>Tác giả: ").append(CrawlerHtml.esc(n.getAuthor())).append("</p>\n");
    }
    if (n.getCreatedAt() != null) {
      String d = new SimpleDateFormat("yyyy-MM-dd").format(n.getCreatedAt());
      body.append("<p><time datetime=\"").append(d).append("\">").append(d).append("</time></p>\n");
    }
    // Thân bài: rút thành văn bản thuần rồi bọc lại từng đoạn.
    for (String p : CrawlerHtml.htmlToParagraphs(n.getFullContent())) {
      body.append("<p>").append(CrawlerHtml.esc(p)).append("</p>\n");
    }
    body.append("</article>\n");

    return CrawlerHtml.head(title + " — Luật POIP Legal", desc, image, url, "article")
        + body
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  /** Danh sách dịch vụ cho khối điều hướng, lấy từ DB nên luôn khớp với sitemap và menu thật. */
  private List<String[]> serviceLinks() {
    return childrenServiceRepository.findAll().stream()
        .filter(c -> c.getHref() != null && !c.getHref().isBlank())
        .map(c -> new String[] {c.getHref(), c.getTitle() == null ? c.getHref() : c.getTitle()})
        .toList();
  }
}

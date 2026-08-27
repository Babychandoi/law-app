package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.entity.News;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.seo.CrawlerHtml;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTML văn bản thuần cho các TRANG DANH SÁCH: trang chủ, /dich-vu và /tin-tuc.
 *
 * <p>Chỉ dựng ba trang này vì nội dung của chúng nằm trong DB nên sinh ra được mà không phải chép
 * lại câu chữ đang nằm trong JSX. Các trang như /ve-chung-toi hay /lien-he có nội dung viết thẳng
 * trong component; chép sang đây sẽ tạo ra hai bản dễ lệch nhau, và bản cho bot khác bản cho người
 * chính là cloaking. Thông tin liên hệ đã có sẵn ở footer của mọi trang bot.
 */
@RestController
@RequestMapping("/og")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ListingOgController {

  ChildrenServiceRepository childrenServiceRepository;
  NewsRepository newsRepository;

  @GetMapping(value = "/home", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String home() {
    StringBuilder b = new StringBuilder();
    b.append("<h1>Luật POIP Legal — Tư vấn sở hữu trí tuệ và pháp lý doanh nghiệp</h1>\n");
    b.append("<p>CÔNG TY TNHH POIP LEGAL tư vấn và thực hiện thủ tục sở hữu trí tuệ, giấy phép ")
        .append("và pháp lý doanh nghiệp tại Việt Nam.</p>\n");
    appendServices(b);
    appendLatestNews(b, 10);
    return CrawlerHtml.head(
            "Luật POIP Legal — Tư vấn sở hữu trí tuệ & pháp lý doanh nghiệp",
            "Tư vấn và thực hiện đăng ký nhãn hiệu, bản quyền, kiểu dáng công nghiệp, giấy phép"
                + " doanh nghiệp.",
            OgController.DEFAULT_IMAGE,
            CrawlerHtml.SITE + "/",
            "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  @GetMapping(value = "/services", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String services() {
    StringBuilder b = new StringBuilder();
    b.append("<h1>Dịch vụ của Luật POIP Legal</h1>\n");
    appendServices(b);
    return CrawlerHtml.head(
            "Dịch vụ — Luật POIP Legal",
            "Danh mục dịch vụ sở hữu trí tuệ, giấy phép và pháp lý doanh nghiệp.",
            OgController.DEFAULT_IMAGE,
            CrawlerHtml.SITE + "/dich-vu",
            "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  @GetMapping(value = "/news", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String newsList() {
    StringBuilder b = new StringBuilder();
    b.append("<h1>Tin tức pháp lý</h1>\n");
    appendLatestNews(b, 50);
    return CrawlerHtml.head(
            "Tin tức — Luật POIP Legal",
            "Bài viết về sở hữu trí tuệ và pháp lý doanh nghiệp.",
            OgController.DEFAULT_IMAGE,
            CrawlerHtml.SITE + "/tin-tuc",
            "website")
        + b
        + CrawlerHtml.nav(serviceLinks())
        + CrawlerHtml.footer();
  }

  private void appendServices(StringBuilder b) {
    b.append("<h2>Dịch vụ</h2>\n<ul>\n");
    childrenServiceRepository.findAll().stream()
        .filter(c -> c.getHref() != null && !c.getHref().isBlank())
        .forEach(
            c -> {
              b.append("<li><a href=\"")
                  .append(CrawlerHtml.esc(CrawlerHtml.SITE + c.getHref()))
                  .append("\">")
                  .append(CrawlerHtml.esc(c.getTitle() == null ? c.getHref() : c.getTitle()))
                  .append("</a>");
              if (c.getDescription() != null && !c.getDescription().isBlank()) {
                b.append(" — ").append(CrawlerHtml.esc(c.getDescription()));
              }
              b.append("</li>\n");
            });
    b.append("</ul>\n");
  }

  private void appendLatestNews(StringBuilder b, int limit) {
    List<News> all = newsRepository.findAll();
    if (all.isEmpty()) return;
    b.append("<h2>Tin tức mới nhất</h2>\n<ul>\n");
    all.stream()
        .sorted(
            (x, y) -> {
              if (x.getCreatedAt() == null || y.getCreatedAt() == null) return 0;
              return y.getCreatedAt().compareTo(x.getCreatedAt());
            })
        .limit(limit)
        .forEach(
            n -> {
              b.append("<li><a href=\"")
                  .append(CrawlerHtml.esc(CrawlerHtml.SITE + "/tin-tuc/" + n.getId()))
                  .append("\">")
                  .append(CrawlerHtml.esc(n.getTitle() == null ? n.getId() : n.getTitle()))
                  .append("</a>");
              if (n.getSubtitle() != null && !n.getSubtitle().isBlank()) {
                b.append(" — ").append(CrawlerHtml.esc(n.getSubtitle()));
              }
              b.append("</li>\n");
            });
    b.append("</ul>\n");
  }

  private List<String[]> serviceLinks() {
    return childrenServiceRepository.findAll().stream()
        .filter(c -> c.getHref() != null && !c.getHref().isBlank())
        .map(c -> new String[] {c.getHref(), c.getTitle() == null ? c.getHref() : c.getTitle()})
        .toList();
  }
}

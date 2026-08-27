package org.law_app.backend.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.News;
import org.law_app.backend.entity.Services;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.repository.ServiceRepository;
import org.law_app.backend.seo.CrawlerHtml;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  ServiceRepository serviceRepository;

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

  /**
   * Trang danh mục dịch vụ: /dich-vu-khac, /dich-vu-doanh-nghiep và mọi danh mục thêm sau này.
   *
   * <p>/dich-vu có trang riêng (component Service) nên dùng /og/services, không đi qua đây.
   *
   * <p>CÂU CHỮ PHẢI KHỚP FRONTEND. Bản cho bot khác bản cho người là cloaking, nên phần copy dưới
   * đây chép đúng từ ServiceDirectory và servicedif/content.tsx. Sửa câu chữ ở frontend thì phải
   * sửa cả ở đây — đây là chỗ dễ lệch nhất của toàn bộ mảng render cho trình quét.
   */
  @GetMapping(
      value = "/service-group/{slug}",
      produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String serviceGroup(@PathVariable String slug) {
    String href = "/" + slug;
    String url = CrawlerHtml.SITE + href;
    Services group =
        serviceRepository.findAll().stream()
            .filter(s -> href.equals(s.getHref()))
            .findFirst()
            .orElse(null);
    if (group == null) {
      return CrawlerHtml.head(
              "Không tìm thấy trang — Luật POIP Legal",
              "",
              OgController.DEFAULT_IMAGE,
              url,
              "website")
          + CrawlerHtml.nav(serviceLinks())
          + CrawlerHtml.footer();
    }

    String title = group.getTitle() == null ? "Dịch vụ" : group.getTitle();
    boolean laDichVuKhac = "/dich-vu-khac".equals(href);

    // servicedif/content.tsx đặt heading khác tên danh mục trong DB; các danh mục còn lại đi qua
    // nhánh 'group' của DynamicServicePage nên heading chính là tên danh mục.
    String heading = laDichVuKhac ? "Dịch vụ pháp lý khác" : title;
    String intro =
        laDichVuKhac
            ? "Tìm hiểu các dịch vụ giấy phép và tư vấn doanh nghiệp, kết hợp với hỗ trợ trực tiếp"
                + " từ Luật Poip Legal."
            : "Chọn dịch vụ phù hợp để xem quy trình, hồ sơ cần chuẩn bị và bước tư vấn tiếp theo.";
    String seoTitle =
        laDichVuKhac ? "Dịch Vụ Khác - Luật Poip Legal" : title + " - Luật Poip Legal";
    String seoDesc =
        laDichVuKhac
            ? "Luật Poip Legal cung cấp các dịch vụ pháp lý khác ngoài sở hữu trí tuệ. Chúng tôi hỗ"
                + " trợ tư vấn miễn phí về các vấn đề pháp lý đa dạng."
            : "Các dịch vụ " + title + " tại Luật Poip Legal";

    StringBuilder b = new StringBuilder();
    // /dich-vu-khac có HeroService phía trên ServiceDirectory, tức là trên trang thật đang có HAI
    // thẻ h1. Ở bản cho bot chỉ để một h1 và đưa chữ của hero xuống đoạn văn: nội dung giữ nguyên,
    // còn thứ bậc tiêu đề thì không tự tạo thêm lỗi "nhiều hơn một thẻ H1".
    if (laDichVuKhac) {
      b.append("<p>").append(CrawlerHtml.esc(title)).append(" — Poip Legal Law</p>\n");
    }
    b.append("<p>Hướng dẫn dịch vụ</p>\n");
    b.append("<h1>").append(CrawlerHtml.esc(heading)).append("</h1>\n");
    b.append("<p>").append(CrawlerHtml.esc(intro)).append("</p>\n");

    List<ChildrenServices> children = childrenServiceRepository.findByParentService(group);
    for (ChildrenServices c : children) {
      if (c.getHref() == null || c.getHref().isBlank()) continue;
      b.append("<h2><a href=\"")
          .append(CrawlerHtml.esc(CrawlerHtml.SITE + c.getHref()))
          .append("\">")
          .append(CrawlerHtml.esc(c.getTitle() == null ? c.getHref() : c.getTitle()))
          .append("</a></h2>\n");
      if (c.getDescription() != null && !c.getDescription().isBlank()) {
        b.append("<p>").append(CrawlerHtml.esc(c.getDescription())).append("</p>\n");
      }
    }
    if (children.isEmpty()) {
      b.append("<h2>Chưa có dịch vụ nào</h2>\n<p>Vui lòng quay lại sau.</p>\n");
    }

    return CrawlerHtml.head(seoTitle, seoDesc, OgController.DEFAULT_IMAGE, url, "website")
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

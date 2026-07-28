package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.service.NewsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Trả HTML tối giản có thẻ Open Graph/Twitter ĐÚNG theo từng nội dung, dành cho BOT mạng xã hội
 * (Facebook/Zalo/… không chạy JS nên không đọc được OG do SPA set runtime). nginx của frontend phát
 * hiện user-agent bot và proxy `/tin-tuc/{slug}` sang đây; người dùng thật vẫn nhận SPA bình
 * thường.
 */
@RestController
@RequestMapping("/og")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class OgController {

  NewsService newsService;

  private static final String SITE = "https://luatpoip.com";
  private static final String DEFAULT_IMAGE = SITE + "/assets/images/og-logo.png";

  @GetMapping(value = "/news/{slug}", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
  public String newsOg(@PathVariable String slug) {
    String url = SITE + "/tin-tuc/" + slug;
    try {
      NewsResponse n = newsService.getNewsById(slug);
      String title = n.getTitle() != null ? n.getTitle() : "Luật Poip Legal";
      String desc = n.getSubtitle() != null ? n.getSubtitle() : "";
      String image = n.getImage() != null && !n.getImage().isBlank() ? n.getImage() : DEFAULT_IMAGE;
      return html(title, desc, image, url, "article");
    } catch (Exception e) {
      // Không tìm thấy bài / lỗi -> trả OG mặc định của site để bot vẫn có preview.
      return html(
          "Luật Poip Legal — Tư vấn sở hữu trí tuệ & pháp lý doanh nghiệp",
          "Tư vấn và đăng ký nhãn hiệu, bản quyền, sáng chế, kiểu dáng, giấy phép doanh nghiệp.",
          DEFAULT_IMAGE,
          url,
          "website");
    }
  }

  /** Sinh HTML OG. Escape để không vỡ thuộc tính khi tiêu đề/mô tả có ký tự đặc biệt. */
  private String html(String title, String desc, String image, String url, String ogType) {
    String t = esc(title);
    String d = esc(desc);
    String img = esc(image);
    String u = esc(url);
    return "<!doctype html>\n"
        + "<html lang=\"vi\"><head>\n"
        + "<meta charset=\"utf-8\">\n"
        + "<title>"
        + t
        + " — Luật Poip Legal</title>\n"
        + "<meta name=\"description\" content=\""
        + d
        + "\">\n"
        + "<link rel=\"canonical\" href=\""
        + u
        + "\">\n"
        + "<meta property=\"og:type\" content=\""
        + esc(ogType)
        + "\">\n"
        + "<meta property=\"og:site_name\" content=\"Luật Poip Legal\">\n"
        + "<meta property=\"og:locale\" content=\"vi_VN\">\n"
        + "<meta property=\"og:title\" content=\""
        + t
        + "\">\n"
        + "<meta property=\"og:description\" content=\""
        + d
        + "\">\n"
        + "<meta property=\"og:image\" content=\""
        + img
        + "\">\n"
        + "<meta property=\"og:url\" content=\""
        + u
        + "\">\n"
        + "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
        + "<meta name=\"twitter:title\" content=\""
        + t
        + "\">\n"
        + "<meta name=\"twitter:description\" content=\""
        + d
        + "\">\n"
        + "<meta name=\"twitter:image\" content=\""
        + img
        + "\">\n"
        + "</head><body>\n"
        + "<h1>"
        + t
        + "</h1>\n<p>"
        + d
        + "</p>\n<a href=\""
        + u
        + "\">Xem bài viết trên luatpoip.com</a>\n"
        + "</body></html>";
  }

  private static String esc(String s) {
    if (s == null) return "";
    return s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
  }
}

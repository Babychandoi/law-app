package org.law_app.backend.controller;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.JobRepository;
import org.law_app.backend.repository.LandingPageRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sitemap ĐỘNG: trang tĩnh + dịch vụ (cha/con) + tin tức + tuyển dụng + landing đã xuất bản, lấy
 * thẳng từ DB. Public, phục vụ tại luatpoip.com/sitemap.xml qua proxy của frontend nginx.
 *
 * <p>Chỉ liệt kê URL mà khách vãng lai mở được và trang đó cho phép index. Landing còn ở bản nháp
 * trả 404 nên bị loại — đưa vào sitemap sẽ khiến Search Console báo lỗi "Submitted URL not found".
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

  private final ServiceRepository serviceRepository;
  private final ChildrenServiceRepository childrenServiceRepository;
  private final NewsRepository newsRepository;
  private final JobRepository jobRepository;
  private final LandingPageRepository landingPageRepository;

  @Value("${app.public-url:https://luatpoip.com}")
  private String baseUrl;

  /** W3C Datetime, mức ngày — đủ cho Google và không lộ nhịp cập nhật theo giờ. */
  private static final DateTimeFormatter LASTMOD =
      DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

  private static final List<String> STATIC_PATHS =
      List.of(
          "/",
          "/ve-chung-toi",
          "/lien-he",
          "/tuyen-dung",
          "/tin-tuc",
          "/dich-vu",
          "/dich-vu-khac",
          "/chinh-sach-bao-mat");

  @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
  public String sitemap() {
    String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

    // LinkedHashMap: giữ thứ tự (trang tĩnh trước) và tự khử URL trùng, ưu tiên lastmod gặp trước.
    Map<String, String> urls = new LinkedHashMap<>();

    STATIC_PATHS.forEach(p -> put(urls, p, null));

    serviceRepository.findAll().forEach(s -> put(urls, s.getHref(), null));
    childrenServiceRepository.findAll().forEach(c -> put(urls, c.getHref(), null));
    newsRepository.findAll().forEach(n -> put(urls, "/tin-tuc/" + n.getId(), n.getCreatedAt()));
    jobRepository
        .findAll()
        .forEach(j -> put(urls, "/tuyen-dung/vi-tri/" + j.getId(), j.getPostedDate()));

    // Landing: chỉ bản đã xuất bản. Bản nháp trả 404 nên không được đưa ra cho Google.
    landingPageRepository.findAllWithService().stream()
        .filter(l -> l.isPublished())
        .forEach(l -> put(urls, "/lp/" + l.getSlug(), l.getUpdatedAt()));

    StringBuilder xml = new StringBuilder();
    xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
    for (Map.Entry<String, String> entry : urls.entrySet()) {
      xml.append("<url><loc>").append(escape(base + entry.getKey())).append("</loc>");
      if (entry.getValue() != null) {
        xml.append("<lastmod>").append(entry.getValue()).append("</lastmod>");
      }
      xml.append("</url>");
    }
    xml.append("</urlset>");
    return xml.toString();
  }

  private void put(Map<String, String> urls, String href, Date lastmod) {
    if (href == null || href.isBlank()) {
      return;
    }
    String path = href.startsWith("/") ? href : "/" + href;
    // Bỏ qua đường dẫn còn placeholder (an toàn) như ":id".
    if (path.contains(":")) {
      return;
    }
    urls.putIfAbsent(path, format(lastmod));
  }

  private String format(Date date) {
    return date == null ? null : LASTMOD.format(Instant.ofEpochMilli(date.getTime()));
  }

  private String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }
}

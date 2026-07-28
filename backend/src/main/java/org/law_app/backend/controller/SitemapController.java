package org.law_app.backend.controller;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.JobRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sitemap ĐỘNG: gồm trang tĩnh + toàn bộ dịch vụ (cha/con) + tin tức + tuyển dụng từ DB. Thay cho
 * sitemap.xml tĩnh (vốn chứa URL literal ":id" và bỏ sót nội dung CMS). Public, phục vụ tại
 * luatpoip.com/sitemap.xml qua proxy của frontend nginx.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

  private final ServiceRepository serviceRepository;
  private final ChildrenServiceRepository childrenServiceRepository;
  private final NewsRepository newsRepository;
  private final JobRepository jobRepository;

  @Value("${app.public-url:https://luatpoip.com}")
  private String baseUrl;

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

    List<String> paths = new ArrayList<>(STATIC_PATHS);

    serviceRepository.findAll().forEach(s -> addPath(paths, s.getHref()));
    childrenServiceRepository.findAll().forEach(c -> addPath(paths, c.getHref()));
    newsRepository.findAll().forEach(n -> addPath(paths, "/tin-tuc/" + n.getId()));
    jobRepository.findAll().forEach(j -> addPath(paths, "/tuyen-dung/vi-tri/" + j.getId()));

    StringBuilder xml = new StringBuilder();
    xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
    for (String p : paths.stream().distinct().toList()) {
      xml.append("<url><loc>").append(escape(base + p)).append("</loc></url>");
    }
    xml.append("</urlset>");
    return xml.toString();
  }

  private void addPath(List<String> paths, String href) {
    if (href == null || href.isBlank()) {
      return;
    }
    String p = href.startsWith("/") ? href : "/" + href;
    // Bỏ qua đường dẫn còn placeholder (an toàn) như ":id".
    if (p.contains(":")) {
      return;
    }
    paths.add(p);
  }

  private String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }
}

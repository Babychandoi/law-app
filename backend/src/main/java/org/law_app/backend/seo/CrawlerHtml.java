package org.law_app.backend.seo;

import java.util.List;
import java.util.Map;

/**
 * Tiện ích dựng HTML văn bản thuần cho TRÌNH QUÉT (Googlebot, Semrush, bot mạng xã hội, bot AI).
 *
 * <p>Website là SPA React nên HTML thô chỉ có {@code <div id="root">} rỗng: 0 liên kết, 0 thẻ h1,
 * 166 ký tự văn bản. Trình quét không chạy JavaScript không thấy gì để đọc cũng không có liên kết
 * để đi tiếp — đó là lý do Semrush chỉ quét được 2 trang trên toàn site.
 *
 * <p>QUY TẮC BẮT BUỘC: HTML sinh ra ở đây phải lấy từ CÙNG nguồn dữ liệu mà SPA dùng, không thêm từ
 * khoá, không đổi nội dung. Trả nội dung khác nhau cho bot và cho người là cloaking và bị Google
 * phạt. Dynamic rendering chỉ hợp lệ khi hai bên tương đương.
 */
public final class CrawlerHtml {

  private CrawlerHtml() {}

  public static final String SITE = "https://luatpoip.com";

  /** Escape ký tự đặc biệt để không vỡ thuộc tính hoặc chèn được thẻ lạ. */
  public static String esc(String s) {
    if (s == null) return "";
    return s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }

  /**
   * Rút HTML của trình soạn thảo thành văn bản thuần, giữ lại ranh giới đoạn.
   *
   * <p>Cố ý KHÔNG giữ lại thẻ HTML gốc. Lọc HTML bằng biểu thức chính quy là cách làm sai kinh điển
   * và luôn có đường lách; nội dung này do admin nhập nhưng trang lại phục vụ bất kỳ ai giả
   * User-Agent bot, nên bỏ hết thẻ là biên an toàn duy nhất chắc chắn đúng. Trình quét cần chữ,
   * không cần định dạng.
   */
  public static List<String> htmlToParagraphs(String html) {
    if (html == null || html.isBlank()) return List.of();
    String s = html;
    // Bỏ hẳn phần không phải nội dung đọc được
    s = s.replaceAll("(?is)<script.*?</script>", " ");
    s = s.replaceAll("(?is)<style.*?</style>", " ");
    // Thẻ kết thúc khối -> dấu ngắt đoạn
    s = s.replaceAll("(?i)</(p|div|h[1-6]|li|tr|blockquote|section|article)\\s*>", "\n\n");
    s = s.replaceAll("(?i)<br\\s*/?>", "\n");
    // Bỏ toàn bộ thẻ còn lại
    s = s.replaceAll("(?s)<[^>]*>", " ");
    s = decodeEntities(s);
    String[] parts = s.split("\n{2,}");
    return java.util.Arrays.stream(parts)
        .map(p -> p.replaceAll("\\s+", " ").trim())
        .filter(p -> !p.isEmpty())
        .toList();
  }

  private static final Map<String, String> ENTITIES =
      Map.of(
          "&nbsp;", " ",
          "&amp;", "&",
          "&lt;", "<",
          "&gt;", ">",
          "&quot;", "\"",
          "&#39;", "'",
          "&apos;", "'",
          "&hellip;", "…",
          "&mdash;", "—",
          "&ndash;", "–");

  private static String decodeEntities(String s) {
    String out = s;
    for (Map.Entry<String, String> e : ENTITIES.entrySet()) {
      out = out.replace(e.getKey(), e.getValue());
    }
    // Thực thể dạng số, ví dụ &#8220;
    return out.replaceAll("&#(\\d{1,6});", "").replaceAll("&[a-zA-Z]{2,10};", "");
  }

  /** Đầu tài liệu: thẻ meta, canonical, Open Graph, Twitter. */
  public static String head(String title, String desc, String image, String url, String ogType) {
    String t = esc(title);
    String d = esc(desc);
    return "<!doctype html>\n<html lang=\"vi\"><head>\n"
        + "<meta charset=\"utf-8\">\n"
        + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        + "<title>"
        + t
        + "</title>\n"
        + "<meta name=\"description\" content=\""
        + d
        + "\">\n"
        + "<link rel=\"canonical\" href=\""
        + esc(url)
        + "\">\n"
        + "<meta property=\"og:type\" content=\""
        + esc(ogType)
        + "\">\n"
        + "<meta property=\"og:site_name\" content=\"Luật POIP Legal\">\n"
        + "<meta property=\"og:locale\" content=\"vi_VN\">\n"
        + "<meta property=\"og:title\" content=\""
        + t
        + "\">\n"
        + "<meta property=\"og:description\" content=\""
        + d
        + "\">\n"
        + "<meta property=\"og:image\" content=\""
        + esc(image)
        + "\">\n"
        + "<meta property=\"og:url\" content=\""
        + esc(url)
        + "\">\n"
        + "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
        + "<meta name=\"twitter:title\" content=\""
        + t
        + "\">\n"
        + "<meta name=\"twitter:description\" content=\""
        + d
        + "\">\n"
        + "<meta name=\"twitter:image\" content=\""
        + esc(image)
        + "\">\n"
        + "</head><body>\n";
  }

  /**
   * Khối điều hướng đặt cuối mỗi trang cho bot.
   *
   * <p>Đây mới là thứ chữa gốc bệnh: HTML thô của SPA không có liên kết nào nên trình quét vào
   * trang chủ là hết đường đi. Có khối này thì từ bất kỳ trang nào bot cũng lần được sang trang
   * khác, thay vì dừng lại sau 1-2 trang như báo cáo Semrush cho thấy.
   */
  public static String nav(List<String[]> serviceLinks) {
    StringBuilder sb = new StringBuilder();
    sb.append("<nav><h2>Dịch vụ của Luật POIP Legal</h2>\n<ul>\n");
    for (String[] s : serviceLinks) {
      sb.append("<li><a href=\"")
          .append(esc(SITE + s[0]))
          .append("\">")
          .append(esc(s[1]))
          .append("</a></li>\n");
    }
    sb.append("</ul>\n<ul>\n")
        .append(link("/", "Trang chủ"))
        .append(link("/dich-vu", "Tất cả dịch vụ"))
        .append(link("/tin-tuc", "Tin tức"))
        .append(link("/ve-chung-toi", "Về chúng tôi"))
        .append(link("/lien-he", "Liên hệ"))
        .append(link("/tuyen-dung", "Tuyển dụng"))
        .append("</ul>\n</nav>\n");
    return sb.toString();
  }

  private static String link(String href, String label) {
    return "<li><a href=\"" + esc(SITE + href) + "\">" + esc(label) + "</a></li>\n";
  }

  public static String footer() {
    return "<footer><p>CÔNG TY TNHH POIP LEGAL — Hotline 0947 600 064 — luatpoip@gmail.com</p>"
        + "<p>Số 70 Ngách 6, Ngõ 10 Tả Thanh Oai, xã Đại Thanh, Hà Nội</p></footer>\n"
        + "</body></html>";
  }
}

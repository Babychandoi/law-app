package org.law_app.backend.seo;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * CrawlerHtml sinh ra HTML mà Googlebot đọc. Sai ở đây thì hỏng âm thầm: trang vẫn trả 200, không
 * có lỗi trong log, chỉ là nội dung Google thấy bị méo — và phải hàng tuần sau mới lộ qua thứ hạng.
 */
class CrawlerHtmlTest {

  @Test
  @DisplayName("Bỏ hẳn script và style, không để lọt mã vào trang cho bot")
  void stripsScriptAndStyle() {
    String html =
        "<p>Nội dung thật</p><script>alert('xss')</script><style>.a{color:red}</style>"
            + "<p>Đoạn hai</p>";

    List<String> paragraphs = CrawlerHtml.htmlToParagraphs(html);

    assertThat(String.join(" ", paragraphs))
        .contains("Nội dung thật")
        .contains("Đoạn hai")
        .doesNotContain("alert")
        .doesNotContain("color:red");
  }

  @Test
  @DisplayName("Tách đúng từng đoạn theo thẻ khối")
  void splitsBlockLevelTags() {
    String html = "<h2>Tiêu đề</h2><p>Đoạn một</p><ul><li>Mục A</li><li>Mục B</li></ul>";

    List<String> paragraphs = CrawlerHtml.htmlToParagraphs(html);

    assertThat(paragraphs).contains("Tiêu đề", "Đoạn một", "Mục A", "Mục B");
  }

  @Test
  @DisplayName("Giải mã thực thể HTML để Google đọc được chữ, không phải mã")
  void decodesEntities() {
    String html = "<p>Nh&#227;n hi&#7879;u &amp; b&#7843;n quy&#7873;n&nbsp;&mdash; POIP</p>";

    List<String> paragraphs = CrawlerHtml.htmlToParagraphs(html);

    assertThat(paragraphs).hasSize(1);
    assertThat(paragraphs.get(0)).contains("&").contains("—").doesNotContain("&amp;");
  }

  @Test
  @DisplayName("Không sinh đoạn rỗng khi HTML có nhiều thẻ lồng nhau")
  void ignoresEmptyParagraphs() {
    String html = "<div><div><p></p></div></div><p>  </p><p>Có chữ</p>";

    assertThat(CrawlerHtml.htmlToParagraphs(html)).containsExactly("Có chữ");
  }

  @Test
  @DisplayName("Đầu vào rỗng hoặc null trả danh sách rỗng, không ném lỗi")
  void handlesEmptyInput() {
    assertThat(CrawlerHtml.htmlToParagraphs(null)).isEmpty();
    assertThat(CrawlerHtml.htmlToParagraphs("")).isEmpty();
    assertThat(CrawlerHtml.htmlToParagraphs("   ")).isEmpty();
  }

  @Test
  @DisplayName("esc chặn được việc chèn thẻ qua dữ liệu người dùng nhập")
  void escapesDangerousCharacters() {
    String injected = "<img src=x onerror=alert(1)>";

    String escaped = CrawlerHtml.esc(injected);

    assertThat(escaped).doesNotContain("<img").contains("&lt;img");
  }

  @Test
  @DisplayName("Khối điều hướng luôn có liên kết — đây là thứ chữa gốc bệnh SPA 0 liên kết")
  void navAlwaysContainsLinks() {
    String nav =
        CrawlerHtml.nav(
            List.of(
                new String[] {"/dang-ky-bao-ho-nhan-hieu", "Đăng ký bảo hộ nhãn hiệu"},
                new String[] {"/ma-so-ma-vach", "Mã số mã vạch"}));

    assertThat(nav)
        .contains("https://luatpoip.com/dang-ky-bao-ho-nhan-hieu")
        .contains("Đăng ký bảo hộ nhãn hiệu")
        .contains("https://luatpoip.com/tin-tuc");
    // Kể cả khi chưa có dịch vụ nào, vẫn phải còn liên kết tới các trang chính.
    assertThat(CrawlerHtml.nav(List.of())).contains("https://luatpoip.com/dich-vu");
  }

  @Test
  @DisplayName("head sinh đủ canonical và thẻ Open Graph, có escape tiêu đề")
  void headContainsCanonicalAndOgTags() {
    String head =
        CrawlerHtml.head(
            "Tiêu đề \"có ngoặc\"",
            "Mô tả",
            "https://luatpoip.com/a.png",
            "https://luatpoip.com/x",
            "article");

    assertThat(head)
        .contains("<link rel=\"canonical\" href=\"https://luatpoip.com/x\">")
        .contains("og:type\" content=\"article\"")
        .contains("&quot;có ngoặc&quot;");
  }
}

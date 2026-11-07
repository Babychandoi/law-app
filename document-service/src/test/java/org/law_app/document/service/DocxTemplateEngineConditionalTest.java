package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.docx4j.TraversalUtil;
import org.docx4j.XmlUtils;
import org.docx4j.jaxb.Context;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.ObjectFactory;
import org.docx4j.wml.P;
import org.docx4j.wml.R;
import org.docx4j.wml.Text;
import org.junit.jupiter.api.Test;

/**
 * Điều kiện (P1.7): giữ/bỏ đoạn giữa ${if_KEY}..${endif_KEY} theo giá trị, kiểm bằng đọc lại DOCX.
 */
class DocxTemplateEngineConditionalTest {

  private final DocxTemplateEngine engine = new DocxTemplateEngine();

  @Test
  void keepsBlockWhenConditionTruthy() throws Exception {
    byte[] out = engine.render(new ByteArrayInputStream(template()), values("Có", "Nguyễn Thị B"));
    String text = allText(out);
    assertThat(text).contains("Hợp đồng A");
    assertThat(text).contains("Vợ/chồng: Nguyễn Thị B");
    assertThat(text).contains("Kết thúc");
    assertThat(text).doesNotContain("${"); // marker + placeholder đã được xử lý hết
  }

  @Test
  void dropsBlockWhenConditionFalsy() throws Exception {
    byte[] out = engine.render(new ByteArrayInputStream(template()), values("", "Không dùng"));
    String text = allText(out);
    assertThat(text).contains("Hợp đồng A");
    assertThat(text).contains("Kết thúc");
    assertThat(text).doesNotContain("Vợ/chồng");
    assertThat(text).doesNotContain("Không dùng");
    assertThat(text).doesNotContain("${");
  }

  private Map<String, String> values(String hasSpouse, String spouseName) {
    Map<String, String> values = new LinkedHashMap<>();
    values.put("title", "Hợp đồng A");
    values.put("hasSpouse", hasSpouse);
    values.put("spouseName", spouseName);
    return values;
  }

  /**
   * Đoạn: ${title} · ${if_hasSpouse} · "Vợ/chồng: ${spouseName}" · ${endif_hasSpouse} · Kết thúc.
   */
  private byte[] template() throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.createPackage();
    var body = pkg.getMainDocumentPart();
    body.addObject(paragraph("${title}"));
    body.addObject(paragraph("${if_hasSpouse}"));
    body.addObject(paragraph("Vợ/chồng: ${spouseName}"));
    body.addObject(paragraph("${endif_hasSpouse}"));
    body.addObject(paragraph("Kết thúc"));
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    pkg.save(output);
    return output.toByteArray();
  }

  private P paragraph(String value) {
    ObjectFactory factory = Context.getWmlObjectFactory();
    P p = factory.createP();
    R run = factory.createR();
    Text text = factory.createText();
    text.setValue(value);
    run.getContent().add(text);
    p.getContent().add(run);
    return p;
  }

  private String allText(byte[] docx) throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.load(new ByteArrayInputStream(docx));
    StringBuilder text = new StringBuilder();
    new TraversalUtil(
        pkg.getMainDocumentPart().getJaxbElement(),
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            if (XmlUtils.unwrap(object) instanceof Text node && node.getValue() != null) {
              text.append(node.getValue()).append(" ");
            }
            return null;
          }
        });
    return text.toString();
  }
}

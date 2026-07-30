package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.docx4j.TraversalUtil;
import org.docx4j.XmlUtils;
import org.docx4j.jaxb.Context;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.ObjectFactory;
import org.docx4j.wml.P;
import org.docx4j.wml.R;
import org.docx4j.wml.Tbl;
import org.docx4j.wml.Text;
import org.docx4j.wml.Tr;
import org.junit.jupiter.api.Test;

/** Trường lặp (P1.6): nhân dòng bảng theo list, kiểm chứng bằng cách đọc lại DOCX kết quả. */
class DocxTemplateEngineListTest {

  private final DocxTemplateEngine engine = new DocxTemplateEngine();

  @Test
  void expandsTableRowsPerListItem() throws Exception {
    byte[] fixture = tableTemplate();

    byte[] out =
        engine.renderWithLists(
            new ByteArrayInputStream(fixture),
            Map.of("title", "Mua bán hàng hóa"),
            Map.of(
                "item",
                List.of(
                    Map.of("name", "Bút bi", "qty", "10"),
                    Map.of("name", "Vở", "qty", "5"),
                    Map.of("name", "Thước", "qty", "3"))));

    String text = allText(out);
    assertThat(text).contains("Mua bán hàng hóa");
    assertThat(text).contains("Bút bi").contains("Vở").contains("Thước");
    assertThat(text).contains("10").contains("5").contains("3");
    assertThat(text).doesNotContain("${"); // không còn placeholder sót
    // Header + 3 dòng dữ liệu = 4 dòng.
    assertThat(countRows(out)).isEqualTo(4);
  }

  @Test
  void emptyListRemovesTemplateRow() throws Exception {
    byte[] out =
        engine.renderWithLists(
            new ByteArrayInputStream(tableTemplate()),
            Map.of("title", "Hợp đồng rỗng"),
            Map.of("item", List.of()));
    assertThat(allText(out)).contains("Hợp đồng rỗng").doesNotContain("${");
    assertThat(countRows(out)).isEqualTo(1); // chỉ còn dòng tiêu đề
  }

  /** Heading ${title} + bảng 2x2: dòng tiêu đề + dòng mẫu ${item__name} | ${item__qty}. */
  private byte[] tableTemplate() throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.createPackage();
    pkg.getMainDocumentPart().addObject(paragraph("Hợp đồng: ${title}"));

    Tbl table = TblFactory.createTable(2, 2, 8_000);
    List<P> cells = allParagraphs(table);
    setText(cells.get(0), "Tên");
    setText(cells.get(1), "SL");
    // Dòng mẫu; ô đầu tách placeholder qua nhiều run để kiểm cross-run.
    cells.get(2).getContent().clear();
    appendRuns(cells.get(2), "${item", "__name}");
    setText(cells.get(3), "${item__qty}");
    pkg.getMainDocumentPart().addObject(table);
    return save(pkg);
  }

  private P paragraph(String value) {
    P p = Context.getWmlObjectFactory().createP();
    appendRuns(p, value);
    return p;
  }

  private void setText(P paragraph, String value) {
    paragraph.getContent().clear();
    appendRuns(paragraph, value);
  }

  private void appendRuns(P paragraph, String... values) {
    ObjectFactory factory = Context.getWmlObjectFactory();
    for (String value : values) {
      R run = factory.createR();
      Text text = factory.createText();
      text.setValue(value);
      run.getContent().add(text);
      paragraph.getContent().add(run);
    }
  }

  private List<P> allParagraphs(Object root) {
    List<P> paragraphs = new ArrayList<>();
    new TraversalUtil(
        root,
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            if (XmlUtils.unwrap(object) instanceof P p) paragraphs.add(p);
            return null;
          }
        });
    return paragraphs;
  }

  private int countRows(byte[] docx) throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.load(new ByteArrayInputStream(docx));
    int[] count = {0};
    new TraversalUtil(
        pkg.getMainDocumentPart().getJaxbElement(),
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            if (XmlUtils.unwrap(object) instanceof Tr) count[0]++;
            return null;
          }
        });
    return count[0];
  }

  private byte[] save(WordprocessingMLPackage pkg) throws Exception {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    pkg.save(output);
    return output.toByteArray();
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

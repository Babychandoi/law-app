package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.docx4j.TraversalUtil;
import org.docx4j.XmlUtils;
import org.docx4j.jaxb.Context;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.openpackaging.parts.WordprocessingML.HeaderPart;
import org.docx4j.relationships.Relationship;
import org.docx4j.wml.Body;
import org.docx4j.wml.FooterReference;
import org.docx4j.wml.HdrFtrRef;
import org.docx4j.wml.HeaderReference;
import org.docx4j.wml.ObjectFactory;
import org.docx4j.wml.P;
import org.docx4j.wml.R;
import org.docx4j.wml.SectPr;
import org.docx4j.wml.Text;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class DocxTemplateEngineTest {
  private final DocxTemplateEngine engine = new DocxTemplateEngine();

  @Test
  void extractsAndRendersSplitRunPlaceholdersAcrossDocumentParts() throws Exception {
    byte[] template = realisticTemplate();

    assertThat(engine.countPlaceholders(new ByteArrayInputStream(template)))
        .containsEntry("customerName", 1)
        .containsEntry("caseCode", 1)
        .containsEntry("headerRef", 1)
        .containsEntry("footerRef", 1);

    byte[] rendered =
        engine.render(
            new ByteArrayInputStream(template),
            Map.of(
                "customerName",
                "Công ty Ánh Dương",
                "caseCode",
                "POIP-2026-001",
                "headerRef",
                "HS-HEADER",
                "footerRef",
                "Trang cuối"));

    engine.validatePackage(new ByteArrayInputStream(rendered));
    assertThat(engine.extractPlaceholders(new ByteArrayInputStream(rendered))).isEmpty();
    assertThat(allText(rendered))
        .contains("Công ty Ánh Dương")
        .contains("POIP-2026-001")
        .contains("HS-HEADER")
        .contains("Trang cuối");
  }

  @Test
  void appliesMappingAcrossRunsButRejectsAmbiguousLiteral() throws Exception {
    byte[] source = simpleDocument(splitParagraph("Bên A: ", "Công ", "ty Ánh Dương"));
    byte[] mapped =
        engine.applyMappings(
            new ByteArrayInputStream(source),
            List.of(new DocxTemplateEngine.TextMapping("Công ty Ánh Dương", "customerName", 1)));

    assertThat(engine.extractPlaceholders(new ByteArrayInputStream(mapped)))
        .containsExactly("customerName");

    byte[] duplicate =
        simpleDocument(
            splitParagraph("Công ty Ánh Dương"), splitParagraph("Đại diện Công ty Ánh Dương"));
    assertThatThrownBy(
            () ->
                engine.applyMappings(
                    new ByteArrayInputStream(duplicate),
                    List.of(
                        new DocxTemplateEngine.TextMapping(
                            "Công ty Ánh Dương", "customerName", 1))))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
  }

  @Test
  void rejectsExternalRelationshipsAndEmbeddedObjects() throws Exception {
    byte[] safe = simpleDocument(splitParagraph("Nội dung an toàn"));

    byte[] external =
        rewriteZip(
            safe,
            "_rels/.rels",
            xml ->
                xml.replace(
                    "</Relationships>",
                    "<Relationship Id=\"evil\" "
                        + "Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink\" "
                        + "Target=\"https://example.invalid\" TargetMode=\"External\"/>"
                        + "</Relationships>"),
            null);
    assertBadRequest(() -> engine.validatePackage(new ByteArrayInputStream(external)));

    byte[] embedded = rewriteZip(safe, null, value -> value, "word/embeddings/payload.bin");
    assertBadRequest(() -> engine.validatePackage(new ByteArrayInputStream(embedded)));
  }

  private byte[] realisticTemplate() throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.createPackage();
    pkg.getMainDocumentPart().addObject(splitParagraph("Khách hàng: ", "${customer", "Name}"));

    var table = TblFactory.createTable(1, 1, 8_000);
    P tableParagraph = firstParagraph(table);
    tableParagraph.getContent().clear();
    appendRuns(tableParagraph, "Mã hồ sơ: ${case", "Code}");
    pkg.getMainDocumentPart().addObject(table);

    ObjectFactory factory = Context.getWmlObjectFactory();
    HeaderPart header = new HeaderPart();
    header.setPackage(pkg);
    header.setJaxbElement(factory.createHdr());
    header.getContent().add(splitParagraph("Header ${header", "Ref}"));
    Relationship headerRelationship = pkg.getMainDocumentPart().addTargetPart(header);

    FooterPart footer = new FooterPart();
    footer.setPackage(pkg);
    footer.setJaxbElement(factory.createFtr());
    footer.getContent().add(splitParagraph("Footer ${footer", "Ref}"));
    Relationship footerRelationship = pkg.getMainDocumentPart().addTargetPart(footer);

    Body body = pkg.getMainDocumentPart().getJaxbElement().getBody();
    SectPr section = body.getSectPr();
    if (section == null) {
      section = factory.createSectPr();
      body.setSectPr(section);
    }
    HeaderReference headerReference = factory.createHeaderReference();
    headerReference.setId(headerRelationship.getId());
    headerReference.setType(HdrFtrRef.DEFAULT);
    FooterReference footerReference = factory.createFooterReference();
    footerReference.setId(footerRelationship.getId());
    footerReference.setType(HdrFtrRef.DEFAULT);
    section.getEGHdrFtrReferences().add(headerReference);
    section.getEGHdrFtrReferences().add(footerReference);
    return save(pkg);
  }

  private byte[] simpleDocument(P... paragraphs) throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.createPackage();
    for (P paragraph : paragraphs) pkg.getMainDocumentPart().addObject(paragraph);
    return save(pkg);
  }

  private P splitParagraph(String... values) {
    ObjectFactory factory = Context.getWmlObjectFactory();
    P paragraph = factory.createP();
    appendRuns(paragraph, values);
    return paragraph;
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

  private P firstParagraph(Object root) {
    List<P> paragraphs = new ArrayList<>();
    new TraversalUtil(
        root,
        new TraversalUtil.CallbackImpl() {
          @Override
          public List<Object> apply(Object object) {
            if (XmlUtils.unwrap(object) instanceof P paragraph) paragraphs.add(paragraph);
            return null;
          }
        });
    return paragraphs.getFirst();
  }

  private byte[] save(WordprocessingMLPackage pkg) throws Exception {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    pkg.save(output);
    return output.toByteArray();
  }

  private String allText(byte[] docx) throws Exception {
    WordprocessingMLPackage pkg = WordprocessingMLPackage.load(new ByteArrayInputStream(docx));
    StringBuilder text = new StringBuilder();
    for (var part : pkg.getParts().getParts().values()) {
      if (!(part instanceof org.docx4j.openpackaging.parts.JaxbXmlPart<?> xmlPart)) continue;
      Object root = xmlPart.getJaxbElement();
      if (root == null) continue;
      new TraversalUtil(
          root,
          new TraversalUtil.CallbackImpl() {
            @Override
            public List<Object> apply(Object object) {
              if (XmlUtils.unwrap(object) instanceof Text node && node.getValue() != null) {
                text.append(node.getValue());
              }
              return null;
            }
          });
    }
    return text.toString();
  }

  private byte[] rewriteZip(
      byte[] source,
      String transformEntry,
      java.util.function.UnaryOperator<String> transform,
      String addedEntry)
      throws Exception {
    ByteArrayOutputStream result = new ByteArrayOutputStream();
    try (ZipInputStream input = new ZipInputStream(new ByteArrayInputStream(source));
        ZipOutputStream output = new ZipOutputStream(result)) {
      ZipEntry entry;
      while ((entry = input.getNextEntry()) != null) {
        byte[] content = input.readAllBytes();
        output.putNextEntry(new ZipEntry(entry.getName()));
        if (entry.getName().equals(transformEntry)) {
          content =
              transform
                  .apply(new String(content, java.nio.charset.StandardCharsets.UTF_8))
                  .getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
        output.write(content);
        output.closeEntry();
      }
      if (addedEntry != null) {
        output.putNextEntry(new ZipEntry(addedEntry));
        output.write(new byte[] {1, 2, 3});
        output.closeEntry();
      }
    }
    return result.toByteArray();
  }

  private void assertBadRequest(org.assertj.core.api.ThrowableAssert.ThrowingCallable callable) {
    assertThatThrownBy(callable)
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
  }
}

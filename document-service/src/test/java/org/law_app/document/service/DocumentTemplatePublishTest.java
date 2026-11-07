package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.domain.DataClassification;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateField;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentTemplateVersion;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.DocumentTemplateVersionRepository;
import org.law_app.document.web.Dtos.PublishTemplateRequest;
import org.law_app.document.web.Dtos.TemplateFieldRequest;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class DocumentTemplatePublishTest {
  @Mock private DocumentTemplateRepository repository;
  @Mock private DocumentTemplateVersionRepository versionRepository;
  @Mock private MinioConfig minioConfig;
  @Mock private MinioDocumentStorageService storage;
  @Mock private DocxTemplateEngine docxTemplateEngine;
  @Mock private DocumentTemplateVersionManager versionManager;
  @Mock private DocumentValueValidator valueValidator;
  @Mock private DocumentAuditService auditService;
  @Mock private DocumentMalwareScanner malwareScanner;
  @Mock private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

  @InjectMocks private DocumentTemplateServiceImpl service;

  @AfterEach
  void clearSecurity() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void saveAndPublishUsesFieldsFromSameRequestAndActivatesNewImmutableVersion() {
    authenticateAdmin();
    DocumentTemplate template =
        DocumentTemplate.builder()
            .id("template-1")
            .name("Hợp đồng cũ")
            .status(DocumentTemplateStatus.DRAFT)
            .version(1)
            .latestVersionId("version-1")
            .templateBucket("templates")
            .templateObjectName("templates/template-1/v1/file.docx")
            .originalFileName("hop-dong.docx")
            .contentType(DocxTemplateEngine.DOCX_CONTENT_TYPE)
            .contentSha256("old-hash")
            .fields(List.of(field("Tên cũ")))
            .revision(7L)
            .build();
    DocumentTemplateVersion oldVersion = version("version-1", 1, "Tên cũ");
    DocumentTemplateVersion publishedVersion = version("version-2", 2, "Tên khách hàng mới");

    when(repository.findById("template-1")).thenReturn(Optional.of(template));
    when(versionManager.prepareAggregate(template)).thenReturn(template);
    when(versionManager.ensureLatestVersion(template)).thenReturn(oldVersion);
    when(versionManager.saveSnapshot(eq(template), eq("Cập nhật điều khoản 2026"), isNull()))
        .thenReturn(publishedVersion);
    when(storage.getObject(any(), any())).thenReturn(new ByteArrayInputStream(new byte[] {1}));
    when(docxTemplateEngine.extractPlaceholders(any()))
        .thenReturn(java.util.Set.of("customerName"));
    when(docxTemplateEngine.countPlaceholders(any())).thenReturn(Map.of("customerName", 1));
    when(docxTemplateEngine.renderWithLists(any(), any(), any())).thenReturn(new byte[] {1, 2, 3});
    when(repository.save(template)).thenReturn(template);

    TemplateFieldRequest submittedField =
        new TemplateFieldRequest(
            "customerName",
            "Tên khách hàng mới",
            "Tên theo giấy đăng ký",
            DocumentFieldInputType.TEXT,
            true,
            1,
            null,
            500,
            null,
            null,
            null,
            List.of(),
            DataClassification.CONFIDENTIAL);
    PublishTemplateRequest request =
        new PublishTemplateRequest(
            List.of(submittedField),
            "Hợp đồng 2026",
            "Phiên bản có hiệu lực mới",
            "service-ip",
            "Sở hữu trí tuệ",
            List.of("contract"),
            "Cập nhật điều khoản 2026",
            null,
            7L);

    var response = service.publish("template-1", request);

    assertThat(response.status()).isEqualTo(DocumentTemplateStatus.ACTIVE);
    assertThat(response.activeVersionId()).isEqualTo("version-2");
    assertThat(response.latestVersionId()).isEqualTo("version-2");
    assertThat(response.hasUnpublishedChanges()).isFalse();
    assertThat(response.fields())
        .singleElement()
        .satisfies(
            field -> {
              assertThat(field.label()).isEqualTo("Tên khách hàng mới");
              assertThat(field.dataClassification()).isEqualTo(DataClassification.CONFIDENTIAL);
            });
    verify(repository).save(template);
    verify(auditService)
        .record(
            eq(DocumentAuditService.TEMPLATE),
            eq("template-1"),
            eq("TEMPLATE_PUBLISHED"),
            eq("DRAFT"),
            eq("ACTIVE"),
            any());
  }

  private DocumentTemplateVersion version(String id, int number, String label) {
    return DocumentTemplateVersion.builder()
        .id(id)
        .templateId("template-1")
        .versionNumber(number)
        .previousVersionId(number == 1 ? null : "version-1")
        .name(number == 1 ? "Hợp đồng cũ" : "Hợp đồng 2026")
        .description("Mô tả")
        .originalFileName("hop-dong.docx")
        .templateBucket("templates")
        .templateObjectName("templates/template-1/v" + number + "/file.docx")
        .contentType(DocxTemplateEngine.DOCX_CONTENT_TYPE)
        .fileSize(100)
        .contentSha256("hash-" + number)
        .fields(List.of(field(label)))
        .serviceId("service-ip")
        .serviceName("Sở hữu trí tuệ")
        .tags(List.of("contract"))
        .build();
  }

  private DocumentTemplateField field(String label) {
    return DocumentTemplateField.builder()
        .fieldKey("customerName")
        .label(label)
        .inputType(DocumentFieldInputType.TEXT)
        .required(true)
        .sortOrder(1)
        .maxLength(500)
        .dataClassification(DataClassification.CONFIDENTIAL)
        .build();
  }

  private void authenticateAdmin() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "admin-1", "n/a", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
  }
}

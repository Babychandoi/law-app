package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.DocumentWorkflowStatus;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.domain.LegalDocumentContext;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.law_app.document.web.Dtos.WorkflowTransitionRequest;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GeneratedDocumentWorkflowTest {
  @Mock private DocumentTemplateRepository templateRepository;
  @Mock private GeneratedDocumentRepository generatedRepository;
  @Mock private MinioDocumentStorageService storage;
  @Mock private DocxTemplateEngine docxTemplateEngine;
  @Mock private org.law_app.document.config.MinioConfig minioConfig;
  @Mock private DocumentTemplateVersionManager versionManager;
  @Mock private DocumentValueValidator valueValidator;
  @Mock private DocumentAuditService auditService;
  @Mock private SensitiveValueEncryptionService encryptionService;
  @Mock private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

  @InjectMocks private GeneratedDocumentServiceImpl service;

  @AfterEach
  void clearSecurity() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void assignedReviewerCanApproveAndAuditCapturesTransition() {
    authenticate("reviewer-1", "ROLE_USER");
    GeneratedDocument document = document(DocumentWorkflowStatus.IN_REVIEW, 4L);
    when(generatedRepository.findById("doc-1")).thenReturn(Optional.of(document));
    when(generatedRepository.save(any(GeneratedDocument.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    var response =
        service.transition(
            "doc-1",
            new WorkflowTransitionRequest(DocumentWorkflowStatus.APPROVED, null, null, 4L));

    assertThat(response.status()).isEqualTo(DocumentWorkflowStatus.APPROVED);
    assertThat(document.getApprovedByUserId()).isEqualTo("reviewer-1");
    assertThat(document.getApprovedAt()).isNotNull();
    verify(auditService)
        .record(
            eq(DocumentAuditService.GENERATED_DOCUMENT),
            eq("doc-1"),
            eq("WORKFLOW_TRANSITION"),
            eq("IN_REVIEW"),
            eq("APPROVED"),
            any());
  }

  @Test
  void authorCannotSelfApproveAndStaleRevisionIsRejected() {
    authenticate("author-1", "ROLE_USER");
    GeneratedDocument document = document(DocumentWorkflowStatus.IN_REVIEW, 5L);
    when(generatedRepository.findById("doc-1")).thenReturn(Optional.of(document));

    assertThatThrownBy(
            () ->
                service.transition(
                    "doc-1",
                    new WorkflowTransitionRequest(DocumentWorkflowStatus.APPROVED, null, null, 5L)))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

    assertThatThrownBy(
            () ->
                service.transition(
                    "doc-1",
                    new WorkflowTransitionRequest(
                        DocumentWorkflowStatus.IN_REVIEW, "reviewer-1", null, 3L)))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
  }

  @Test
  void onlyAdminCanFinalizeAnApprovedDocument() {
    authenticate("admin-1", "ROLE_ADMIN");
    GeneratedDocument document = document(DocumentWorkflowStatus.APPROVED, 8L);
    when(generatedRepository.findById("doc-1")).thenReturn(Optional.of(document));
    when(generatedRepository.save(any(GeneratedDocument.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    var response =
        service.transition(
            "doc-1", new WorkflowTransitionRequest(DocumentWorkflowStatus.FINAL, null, null, 8L));

    assertThat(response.status()).isEqualTo(DocumentWorkflowStatus.FINAL);
    assertThat(document.getFinalizedByUserId()).isEqualTo("admin-1");
    assertThat(document.getFinalizedAt()).isNotNull();
  }

  private GeneratedDocument document(DocumentWorkflowStatus status, Long revision) {
    return GeneratedDocument.builder()
        .id("doc-1")
        .templateId("template-1")
        .templateVersionId("version-1")
        .templateNameSnapshot("Hợp đồng")
        .templateVersionSnapshot(3)
        .generatedFileName("hop-dong.docx")
        .generatedBucket("generated")
        .generatedObjectName("generated/doc-1.docx")
        .context(new LegalDocumentContext())
        .status(status)
        .createdByUserId("author-1")
        .reviewerUserId("reviewer-1")
        .revision(revision)
        .build();
  }

  private void authenticate(String userId, String role) {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                userId, "n/a", List.of(new SimpleGrantedAuthority(role))));
  }
}

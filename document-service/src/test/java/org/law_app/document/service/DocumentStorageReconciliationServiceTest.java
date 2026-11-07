package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.DocumentTemplateVersionRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.law_app.document.service.MinioDocumentStorageService.StoredObject;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

/** P0.6: đối soát dọn file rác — xóa orphan cũ, giữ file được tham chiếu và orphan còn ân hạn. */
@ExtendWith(MockitoExtension.class)
class DocumentStorageReconciliationServiceTest {

  @Mock private DocumentTemplateRepository templateRepository;
  @Mock private DocumentTemplateVersionRepository versionRepository;
  @Mock private GeneratedDocumentRepository generatedRepository;
  @Mock private MinioDocumentStorageService storage;
  @Mock private MinioConfig minioConfig;

  @Test
  void deletesOldOrphansButKeepsReferencedAndRecent() {
    DocumentStorageReconciliationService service =
        new DocumentStorageReconciliationService(
            templateRepository, versionRepository, generatedRepository, storage, minioConfig);
    ReflectionTestUtils.setField(service, "graceHours", 24L);

    Instant old = Instant.now().minus(48, ChronoUnit.HOURS);
    Instant recent = Instant.now().minus(1, ChronoUnit.HOURS);
    when(storage.listObjects("generated"))
        .thenReturn(
            List.of(
                new StoredObject("keep/referenced.docx", old),
                new StoredObject("orphan/old.docx", old),
                new StoredObject("orphan/recent.docx", recent)));

    DocumentStorageReconciliationService.ReconciliationSummary summary =
        service.reconcileBucket("generated", Set.of("keep/referenced.docx"));

    assertThat(summary.scanned()).isEqualTo(3);
    assertThat(summary.deleted()).isEqualTo(1);
    verify(storage).deleteObject("generated", "orphan/old.docx");
    verify(storage, never()).deleteObject(eq("generated"), eq("keep/referenced.docx"));
    verify(storage, never()).deleteObject(eq("generated"), eq("orphan/recent.docx"));
  }
}

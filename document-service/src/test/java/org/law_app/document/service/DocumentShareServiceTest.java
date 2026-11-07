package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.DocumentShareLink;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.repository.DocumentShareLinkRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** P2.4: chia sẻ bảo mật — token hợp lệ tải được (tăng lượt); thu hồi/hết hạn -> 410. */
@ExtendWith(MockitoExtension.class)
class DocumentShareServiceTest {

  @Mock private DocumentShareLinkRepository shareRepository;
  @Mock private GeneratedDocumentRepository generatedRepository;
  @Mock private MinioDocumentStorageService storage;
  @Mock private DocumentAuditService auditService;

  @InjectMocks private DocumentShareServiceImpl service;

  private DocumentShareLink link(boolean revoked, Instant expiresAt, Integer max, int count) {
    return DocumentShareLink.builder()
        .id("s1")
        .tokenHash("h")
        .generatedDocumentId("g1")
        .expiresAt(expiresAt)
        .maxDownloads(max)
        .downloadCount(count)
        .revoked(revoked)
        .build();
  }

  @Test
  void resolvesValidTokenAndIncrementsCount() {
    when(shareRepository.findByTokenHash(any()))
        .thenReturn(Optional.of(link(false, Instant.now().plus(1, ChronoUnit.HOURS), null, 0)));
    when(generatedRepository.findById("g1"))
        .thenReturn(
            Optional.of(
                GeneratedDocument.builder()
                    .id("g1")
                    .generatedBucket("b")
                    .generatedObjectName("o")
                    .generatedFileName("hop-dong.docx")
                    .build()));
    when(storage.getObject("b", "o")).thenReturn(new ByteArrayInputStream(new byte[] {1}));

    DocumentShareService.SharedFile file = service.resolve("tok");

    assertThat(file.fileName()).isEqualTo("hop-dong.docx");
    verify(shareRepository).save(any(DocumentShareLink.class)); // đã tăng lượt tải
  }

  @Test
  void rejectsRevokedLink() {
    when(shareRepository.findByTokenHash(any()))
        .thenReturn(Optional.of(link(true, Instant.now().plus(1, ChronoUnit.HOURS), null, 0)));
    assertThatThrownBy(() -> service.resolve("tok"))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            e ->
                assertThat(((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.GONE));
  }

  @Test
  void rejectsExpiredLink() {
    when(shareRepository.findByTokenHash(any()))
        .thenReturn(Optional.of(link(false, Instant.now().minus(1, ChronoUnit.HOURS), null, 0)));
    assertThatThrownBy(() -> service.resolve("tok"))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            e ->
                assertThat(((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.GONE));
  }
}

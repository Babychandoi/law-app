package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.law_app.document.domain.GeneratedDocument;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class SensitiveValueEncryptionServiceTest {

  @Test
  void encryptsWithoutPlaintextAndDecryptsWithAuthenticatedIdentifiers() {
    byte[] key = new byte[32];
    java.util.Arrays.fill(key, (byte) 7);
    SensitiveValueEncryptionService service =
        service(Base64.getEncoder().encodeToString(key), "key-v1", "");

    var encrypted =
        service.encrypt(
            Map.of("nationalId", "012345678901", "customerName", "Nguyễn Văn A"),
            "document-1",
            "version-1");
    assertThat(encrypted.ciphertext())
        .doesNotContain("012345678901")
        .doesNotContain("Nguyễn Văn A");

    GeneratedDocument document =
        GeneratedDocument.builder()
            .id("document-1")
            .templateVersionId("version-1")
            .encryptedValues(encrypted.ciphertext())
            .encryptionAlgorithm(encrypted.algorithm())
            .encryptionKeyId(encrypted.keyId())
            .values(Map.of())
            .build();
    assertThat(service.decrypt(document))
        .containsEntry("nationalId", "012345678901")
        .containsEntry("customerName", "Nguyễn Văn A");

    document.setTemplateVersionId("tampered-version");
    assertThatThrownBy(() -> service.decrypt(document)).isInstanceOf(ResponseStatusException.class);

    var encryptedReason =
        service.encryptWorkflowReason("Thiếu chữ ký người đại diện", "document-1");
    document.setEncryptedWorkflowReason(encryptedReason.ciphertext());
    document.setWorkflowReasonEncryptionAlgorithm(encryptedReason.algorithm());
    document.setWorkflowReasonEncryptionKeyId(encryptedReason.keyId());
    assertThat(service.decryptWorkflowReason(document)).isEqualTo("Thiếu chữ ký người đại diện");
  }

  @Test
  void decryptsWithPreviousKeyDuringRotationAndReadsLegacyRows() {
    byte[] oldKey = new byte[32];
    byte[] newKey = new byte[32];
    java.util.Arrays.fill(oldKey, (byte) 1);
    java.util.Arrays.fill(newKey, (byte) 2);
    String oldEncoded = Base64.getEncoder().encodeToString(oldKey);
    SensitiveValueEncryptionService oldService = service(oldEncoded, "key-v1", "");
    var encrypted = oldService.encrypt(Map.of("taxId", "0312345678"), "document-2", "version-2");

    SensitiveValueEncryptionService rotated =
        service(Base64.getEncoder().encodeToString(newKey), "key-v2", "key-v1:" + oldEncoded);
    GeneratedDocument historical =
        GeneratedDocument.builder()
            .id("document-2")
            .templateVersionId("version-2")
            .encryptedValues(encrypted.ciphertext())
            .encryptionAlgorithm(encrypted.algorithm())
            .encryptionKeyId("key-v1")
            .build();
    assertThat(rotated.decrypt(historical)).containsEntry("taxId", "0312345678");

    GeneratedDocument legacy =
        GeneratedDocument.builder().values(Map.of("legacy", "value")).build();
    assertThat(rotated.decrypt(legacy)).containsEntry("legacy", "value");
  }

  @Test
  void failsClosedForNewWritesWithoutAValidCurrentKey() {
    SensitiveValueEncryptionService missing = service("", "key-v1", "");
    assertThatThrownBy(() -> missing.encrypt(Map.of("pii", "secret"), "doc", "version"))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
  }

  private SensitiveValueEncryptionService service(String key, String keyId, String previousKeys) {
    SensitiveValueEncryptionService service =
        new SensitiveValueEncryptionService(new ObjectMapper());
    ReflectionTestUtils.setField(service, "encodedKey", key);
    ReflectionTestUtils.setField(service, "keyId", keyId);
    ReflectionTestUtils.setField(service, "previousKeys", previousKeys);
    return service;
  }
}

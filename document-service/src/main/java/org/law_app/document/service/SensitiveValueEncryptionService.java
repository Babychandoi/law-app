package org.law_app.document.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.GeneratedDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Application-layer envelope for PII-bearing generation inputs (AES-256-GCM). */
@Service
@RequiredArgsConstructor
public class SensitiveValueEncryptionService {
  public static final String ALGORITHM = "AES-256-GCM";
  private static final int NONCE_BYTES = 12;
  private static final int TAG_BITS = 128;
  private static final byte PAYLOAD_VERSION = 1;

  private final ObjectMapper objectMapper;
  private final SecureRandom secureRandom = new SecureRandom();

  @Value("${document.encryption.key:}")
  private String encodedKey;

  @Value("${document.encryption.key-id:local-v1}")
  private String keyId;

  @Value("${document.encryption.previous-keys:}")
  private String previousKeys;

  public EncryptedValues encrypt(
      Map<String, String> values, String documentId, String templateVersionId) {
    return encryptPayload(values, documentId, templateVersionId);
  }

  public EncryptedValues encryptWorkflowReason(String reason, String documentId) {
    return encryptPayload(Map.of("reason", reason), documentId, "workflow-reason");
  }

  private EncryptedValues encryptPayload(
      Map<String, String> values, String documentId, String aadScope) {
    SecretKeySpec key = currentEncryptionKey();
    try {
      byte[] nonce = new byte[NONCE_BYTES];
      secureRandom.nextBytes(nonce);
      byte[] plaintext =
          objectMapper.writeValueAsBytes(new TreeMap<>(values == null ? Map.of() : values));
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
      cipher.updateAAD(aad(documentId, aadScope));
      byte[] ciphertext = cipher.doFinal(plaintext);
      ByteBuffer payload =
          ByteBuffer.allocate(1 + nonce.length + ciphertext.length)
              .put(PAYLOAD_VERSION)
              .put(nonce)
              .put(ciphertext);
      return new EncryptedValues(
          Base64.getEncoder().encodeToString(payload.array()), keyId, ALGORITHM, Instant.now());
    } catch (GeneralSecurityException | com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Không mã hóa được dữ liệu tài liệu");
    }
  }

  /**
   * Backward-compatible read: legacy rows may still contain values. New rows authenticate both
   * ciphertext and immutable document/template-version identifiers through GCM AAD.
   */
  public Map<String, String> decrypt(GeneratedDocument document) {
    if (document.getEncryptedValues() == null || document.getEncryptedValues().isBlank()) {
      return document.getValues() == null
          ? Map.of()
          : java.util.Collections.unmodifiableMap(new LinkedHashMap<>(document.getValues()));
    }
    return decryptPayload(
        document.getEncryptedValues(),
        document.getEncryptionAlgorithm(),
        document.getEncryptionKeyId(),
        document.getId(),
        document.getTemplateVersionId());
  }

  public String decryptWorkflowReason(GeneratedDocument document) {
    if (document.getEncryptedWorkflowReason() == null
        || document.getEncryptedWorkflowReason().isBlank()) {
      return document.getRejectionReason();
    }
    return decryptPayload(
            document.getEncryptedWorkflowReason(),
            document.getWorkflowReasonEncryptionAlgorithm(),
            document.getWorkflowReasonEncryptionKeyId(),
            document.getId(),
            "workflow-reason")
        .get("reason");
  }

  private Map<String, String> decryptPayload(
      String encodedPayload,
      String algorithm,
      String payloadKeyId,
      String documentId,
      String aadScope) {
    if (!ALGORITHM.equals(algorithm)) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Thuật toán mã hóa tài liệu không được hỗ trợ");
    }
    try {
      byte[] payload = Base64.getDecoder().decode(encodedPayload);
      if (payload.length <= 1 + NONCE_BYTES || payload[0] != PAYLOAD_VERSION) {
        throw new GeneralSecurityException("Unsupported payload");
      }
      byte[] nonce = java.util.Arrays.copyOfRange(payload, 1, 1 + NONCE_BYTES);
      byte[] ciphertext = java.util.Arrays.copyOfRange(payload, 1 + NONCE_BYTES, payload.length);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(
          Cipher.DECRYPT_MODE, keyForId(payloadKeyId), new GCMParameterSpec(TAG_BITS, nonce));
      cipher.updateAAD(aad(documentId, aadScope));
      byte[] plaintext = cipher.doFinal(ciphertext);
      return objectMapper.readValue(
          plaintext, new TypeReference<LinkedHashMap<String, String>>() {});
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Không giải mã được dữ liệu tài liệu");
    }
  }

  private SecretKeySpec currentEncryptionKey() {
    if (keyId == null || keyId.isBlank() || keyId.contains(",") || keyId.contains(":")) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "DOCUMENT_DATA_ENCRYPTION_KEY_ID không hợp lệ");
    }
    return decodeKey(encodedKey);
  }

  private SecretKeySpec keyForId(String requestedKeyId) {
    if (requestedKeyId != null && requestedKeyId.equals(keyId)) {
      return currentEncryptionKey();
    }
    if (previousKeys != null && !previousKeys.isBlank()) {
      for (String entry : previousKeys.split(",")) {
        int separator = entry.indexOf(':');
        if (separator <= 0) continue;
        String candidateId = entry.substring(0, separator).trim();
        if (candidateId.equals(requestedKeyId)) {
          return decodeKey(entry.substring(separator + 1).trim());
        }
      }
    }
    throw new ResponseStatusException(
        HttpStatus.SERVICE_UNAVAILABLE, "Không có khóa giải mã cho keyId của tài liệu");
  }

  private SecretKeySpec decodeKey(String encoded) {
    if (encoded == null || encoded.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "DOCUMENT_DATA_ENCRYPTION_KEY chưa được cấu hình");
    }
    try {
      byte[] key = Base64.getDecoder().decode(encoded.trim());
      if (key.length != 32) throw new IllegalArgumentException("Key must contain 32 bytes");
      return new SecretKeySpec(key, "AES");
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "DOCUMENT_DATA_ENCRYPTION_KEY phải là Base64 của khóa 32-byte");
    }
  }

  private byte[] aad(String documentId, String templateVersionId) {
    return (documentId + "\n" + templateVersionId).getBytes(StandardCharsets.UTF_8);
  }

  public record EncryptedValues(
      String ciphertext, String keyId, String algorithm, Instant encryptedAt) {}
}

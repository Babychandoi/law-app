package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class PartyPiiCipherTest {

  @Test
  void roundTripUsesRandomAuthenticatedEnvelopesWithoutPlaintext() {
    PartyPiiCipher cipher = cipher((byte) 7);
    String plaintext =
        "{\"displayName\":\"Nguyen Van An\",\"identityDocumentNumber\":\"0123456789\"}";
    String context = "matter\u0000case-1\u0000party-1";

    String first = cipher.encrypt(plaintext, context);
    String second = cipher.encrypt(plaintext, context);

    assertThat(first).startsWith("v2.").doesNotContain("Nguyen", "0123456789");
    assertThat(second).isNotEqualTo(first);
    assertThat(cipher.decrypt(first, context)).isEqualTo(plaintext);
    assertThat(cipher.decrypt(second, context)).isEqualTo(plaintext);
  }

  @Test
  void ciphertextCannotBeMovedToAnotherPartyContext() {
    PartyPiiCipher cipher = cipher((byte) 11);
    String encrypted = cipher.encrypt("sensitive", "case-1\u0000party-1");

    assertThatThrownBy(() -> cipher.decrypt(encrypted, "case-1\u0000party-2"))
        .isInstanceOf(PartyDataIntegrityException.class);
  }

  @Test
  void tamperingIsDetectedByTheGcmAuthenticationTag() {
    PartyPiiCipher cipher = cipher((byte) 13);
    String encrypted = cipher.encrypt("sensitive", "case-1\u0000party-1");
    String[] parts = encrypted.split("\\.");
    byte[] ciphertext = Base64.getUrlDecoder().decode(parts[3]);
    ciphertext[ciphertext.length - 1] ^= 1;
    parts[3] = Base64.getUrlEncoder().withoutPadding().encodeToString(ciphertext);
    String tampered = String.join(".", parts);

    assertThatThrownBy(() -> cipher.decrypt(tampered, "case-1\u0000party-1"))
        .isInstanceOf(PartyDataIntegrityException.class);
  }

  @Test
  void missingMalformedAndNon256BitKeysFailClosedAtUseTime() {
    PartyPiiCipher missing = new PartyPiiCipher("");
    PartyPiiCipher malformed = new PartyPiiCipher("not-base64!");
    PartyPiiCipher shortKey =
        new PartyPiiCipher(
            Base64.getEncoder()
                .encodeToString("sixteen-byte-key".getBytes(StandardCharsets.UTF_8)));

    assertThatThrownBy(missing::requireAvailable)
        .isInstanceOf(PartyEncryptionUnavailableException.class);
    assertThatThrownBy(() -> malformed.encrypt("pii", "context"))
        .isInstanceOf(PartyEncryptionUnavailableException.class);
    assertThatThrownBy(() -> shortKey.decrypt("v1.invalid.invalid", "context"))
        .isInstanceOf(PartyEncryptionUnavailableException.class);
  }

  @Test
  void aDifferentEncryptionKeyCannotDecryptTheEnvelope() {
    String encrypted = cipher((byte) 21).encrypt("sensitive", "context");

    assertThatThrownBy(() -> cipher((byte) 22).decrypt(encrypted, "context"))
        .isInstanceOf(PartyDataIntegrityException.class);
  }

  @Test
  void rotatedKeyRingDecryptsOldEnvelopeAndWritesWithNewKeyId() {
    String oldKey = encodedKey((byte) 31);
    String newKey = encodedKey((byte) 32);
    PartyPiiCipher beforeRotation = new PartyPiiCipher(oldKey, "old", "", new SecureRandom());
    String oldEnvelope = beforeRotation.encrypt("sensitive", "context");

    PartyPiiCipher afterRotation =
        new PartyPiiCipher(newKey, "new", "old:" + oldKey, new SecureRandom());

    assertThat(afterRotation.decrypt(oldEnvelope, "context")).isEqualTo("sensitive");
    assertThat(afterRotation.encrypt("new-value", "context"))
        .startsWith("v2." + base64Url("new") + ".");
  }

  @Test
  void legacyVersionOneEnvelopeRemainsReadableDuringRotation() throws Exception {
    String oldKey = encodedKey((byte) 41);
    String legacy = legacyEnvelope(oldKey, "legacy-sensitive", "context");
    PartyPiiCipher rotated =
        new PartyPiiCipher(encodedKey((byte) 42), "new", "old:" + oldKey, new SecureRandom());

    assertThat(rotated.decrypt(legacy, "context")).isEqualTo("legacy-sensitive");
  }

  @Test
  void malformedPreviousKeyRingFailsClosed() {
    PartyPiiCipher cipher =
        new PartyPiiCipher(encodedKey((byte) 51), "new", "malformed-entry", new SecureRandom());

    assertThatThrownBy(cipher::requireAvailable)
        .isInstanceOf(PartyEncryptionUnavailableException.class);
  }

  private static PartyPiiCipher cipher(byte fill) {
    return new PartyPiiCipher(encodedKey(fill));
  }

  private static String encodedKey(byte fill) {
    byte[] key = new byte[32];
    Arrays.fill(key, fill);
    return Base64.getEncoder().encodeToString(key);
  }

  private static String base64Url(String value) {
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(value.getBytes(StandardCharsets.UTF_8));
  }

  private static String legacyEnvelope(String encodedKey, String value, String context)
      throws Exception {
    byte[] iv = new byte[12];
    Arrays.fill(iv, (byte) 9);
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(
        Cipher.ENCRYPT_MODE,
        new SecretKeySpec(Base64.getDecoder().decode(encodedKey), "AES"),
        new GCMParameterSpec(128, iv));
    cipher.updateAAD(context.getBytes(StandardCharsets.UTF_8));
    byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
    return "v1."
        + Base64.getUrlEncoder().withoutPadding().encodeToString(iv)
        + "."
        + Base64.getUrlEncoder().withoutPadding().encodeToString(encrypted);
  }
}

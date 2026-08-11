package org.law_app.crm.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Versioned AES-256-GCM envelope encryption for matter-party PII.
 *
 * <p>The primary key and every retained previous key must be exactly 32 random bytes encoded as
 * Base64. New envelopes carry a non-secret key id so keys can be rotated without rewriting every
 * party in one deployment. Missing or malformed configuration leaves this component unavailable
 * rather than preventing service startup; every actual party operation then fails closed.
 */
@Component
public class PartyPiiCipher {

  private static final String VERSION = "v2";
  private static final String LEGACY_VERSION = "v1";
  private static final String DEFAULT_KEY_ID = "primary";
  private static final int KEY_BYTES = 32;
  private static final int IV_BYTES = 12;
  private static final int TAG_BITS = 128;

  private final SecureRandom secureRandom;
  private final SecretKey primaryKey;
  private final String primaryKeyId;
  private final Map<String, SecretKey> decryptionKeys;

  @Autowired
  public PartyPiiCipher(
      @Value("${CRM_DATA_ENCRYPTION_KEY:}") String configuredKey,
      @Value("${CRM_DATA_ENCRYPTION_KEY_ID:primary}") String configuredKeyId,
      @Value("${CRM_DATA_ENCRYPTION_PREVIOUS_KEYS:}") String configuredPreviousKeys) {
    this(configuredKey, configuredKeyId, configuredPreviousKeys, new SecureRandom());
  }

  PartyPiiCipher(String configuredKey) {
    this(configuredKey, DEFAULT_KEY_ID, "", new SecureRandom());
  }

  PartyPiiCipher(
      String configuredKey,
      String configuredKeyId,
      String configuredPreviousKeys,
      SecureRandom secureRandom) {
    this.secureRandom = secureRandom;
    KeyRing keyRing = decodeKeyRing(configuredKey, configuredKeyId, configuredPreviousKeys);
    this.primaryKey = keyRing.primaryKey();
    this.primaryKeyId = keyRing.primaryKeyId();
    this.decryptionKeys = keyRing.keys();
  }

  public void requireAvailable() {
    if (primaryKey == null || decryptionKeys.isEmpty()) {
      throw new PartyEncryptionUnavailableException();
    }
  }

  public String encrypt(String plaintext, String context) {
    requireAvailable();
    if (plaintext == null || context == null || context.isBlank()) {
      throw new IllegalArgumentException("Plaintext and encryption context are required");
    }

    byte[] iv = new byte[IV_BYTES];
    secureRandom.nextBytes(iv);
    try {
      byte[] encrypted =
          transform(
              Cipher.ENCRYPT_MODE,
              primaryKey,
              iv,
              plaintext.getBytes(StandardCharsets.UTF_8),
              versionedContext(primaryKeyId, context));
      return VERSION
          + "."
          + encode(primaryKeyId.getBytes(StandardCharsets.UTF_8))
          + "."
          + encode(iv)
          + "."
          + encode(encrypted);
    } catch (GeneralSecurityException ex) {
      throw new PartyDataIntegrityException(ex);
    }
  }

  public String decrypt(String envelope, String context) {
    requireAvailable();
    if (envelope == null || context == null || context.isBlank()) {
      throw new PartyDataIntegrityException();
    }

    try {
      String[] parts = envelope.split("\\.", -1);
      if (parts.length == 4 && VERSION.equals(parts[0])) {
        return decryptVersionTwo(parts, context);
      }
      if (parts.length == 3 && LEGACY_VERSION.equals(parts[0])) {
        return decryptLegacy(parts, context);
      }
      throw new PartyDataIntegrityException();
    } catch (PartyDataIntegrityException ex) {
      throw ex;
    } catch (GeneralSecurityException | IllegalArgumentException ex) {
      throw new PartyDataIntegrityException(ex);
    }
  }

  private String decryptVersionTwo(String[] parts, String context) throws GeneralSecurityException {
    String keyId = new String(decode(parts[1]), StandardCharsets.UTF_8);
    SecretKey key = decryptionKeys.get(keyId);
    if (key == null) {
      throw new PartyDataIntegrityException();
    }
    byte[] iv = decode(parts[2]);
    byte[] encrypted = decode(parts[3]);
    validateEnvelopeBytes(iv, encrypted);
    byte[] plaintext =
        transform(Cipher.DECRYPT_MODE, key, iv, encrypted, versionedContext(keyId, context));
    return new String(plaintext, StandardCharsets.UTF_8);
  }

  private String decryptLegacy(String[] parts, String context) {
    byte[] iv = decode(parts[1]);
    byte[] encrypted = decode(parts[2]);
    validateEnvelopeBytes(iv, encrypted);
    for (SecretKey key : decryptionKeys.values()) {
      try {
        byte[] plaintext =
            transform(
                Cipher.DECRYPT_MODE, key, iv, encrypted, context.getBytes(StandardCharsets.UTF_8));
        return new String(plaintext, StandardCharsets.UTF_8);
      } catch (GeneralSecurityException ignored) {
        // Legacy v1 did not carry a key id, so rotation requires trying the bounded key ring.
      }
    }
    throw new PartyDataIntegrityException();
  }

  private static byte[] transform(
      int mode, SecretKey key, byte[] iv, byte[] value, byte[] additionalData)
      throws GeneralSecurityException {
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(mode, key, new GCMParameterSpec(TAG_BITS, iv));
    cipher.updateAAD(additionalData);
    return cipher.doFinal(value);
  }

  private static byte[] versionedContext(String keyId, String context) {
    return (VERSION + "\u0000" + keyId + "\u0000" + context).getBytes(StandardCharsets.UTF_8);
  }

  private static void validateEnvelopeBytes(byte[] iv, byte[] encrypted) {
    if (iv.length != IV_BYTES || encrypted.length < TAG_BITS / Byte.SIZE) {
      throw new PartyDataIntegrityException();
    }
  }

  private static String encode(byte[] value) {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
  }

  private static byte[] decode(String value) {
    return Base64.getUrlDecoder().decode(value);
  }

  private static KeyRing decodeKeyRing(
      String configuredKey, String configuredKeyId, String configuredPreviousKeys) {
    String primaryId = normalizeKeyId(configuredKeyId);
    SecretKey primary = decodeKey(configuredKey);
    if (primaryId == null || primary == null) {
      return KeyRing.unavailable();
    }

    Map<String, SecretKey> keys = new LinkedHashMap<>();
    keys.put(primaryId, primary);
    if (configuredPreviousKeys != null && !configuredPreviousKeys.isBlank()) {
      String[] entries = configuredPreviousKeys.split(",", -1);
      if (entries.length > 20) {
        return KeyRing.unavailable();
      }
      for (String entry : entries) {
        int separator = entry.indexOf(':');
        if (separator <= 0 || separator == entry.length() - 1) {
          return KeyRing.unavailable();
        }
        String keyId = normalizeKeyId(entry.substring(0, separator));
        SecretKey key = decodeKey(entry.substring(separator + 1));
        if (keyId == null || key == null || keys.containsKey(keyId)) {
          return KeyRing.unavailable();
        }
        keys.put(keyId, key);
      }
    }
    return new KeyRing(primary, primaryId, Map.copyOf(keys));
  }

  private static String normalizeKeyId(String configuredKeyId) {
    if (configuredKeyId == null) return null;
    String keyId = configuredKeyId.trim();
    return keyId.matches("[A-Za-z0-9_-]{1,64}") ? keyId : null;
  }

  private static SecretKey decodeKey(String configuredKey) {
    if (configuredKey == null || configuredKey.isBlank()) {
      return null;
    }
    byte[] decoded = null;
    try {
      decoded = Base64.getDecoder().decode(configuredKey.trim());
      if (decoded.length != KEY_BYTES) {
        return null;
      }
      return new SecretKeySpec(decoded, "AES");
    } catch (IllegalArgumentException ex) {
      return null;
    } finally {
      if (decoded != null) {
        Arrays.fill(decoded, (byte) 0);
      }
    }
  }

  private record KeyRing(SecretKey primaryKey, String primaryKeyId, Map<String, SecretKey> keys) {
    private static KeyRing unavailable() {
      return new KeyRing(null, null, Map.of());
    }
  }
}

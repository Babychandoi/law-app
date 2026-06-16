package org.law_app.chat.config;

import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Verifies JWTs issued by the monolith offline using the shared HS512 signer key. No call to the
 * monolith is needed for signature/expiry validation. The {@link
 * org.law_app.chat.security.RevocationFilter} adds the Redis blacklist check separately so logout
 * stays in sync across services.
 */
@Configuration
public class JwtConfig {

  @Value("${jwt.signerKey}")
  private String signerKey;

  @Bean
  public JwtDecoder jwtDecoder() {
    SecretKeySpec secretKey = new SecretKeySpec(signerKey.getBytes(), "HmacSHA512");
    return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS512).build();
  }
}

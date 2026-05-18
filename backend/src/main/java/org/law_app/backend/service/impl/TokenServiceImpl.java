package org.law_app.backend.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.entity.User;
import org.law_app.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class TokenServiceImpl implements TokenService {
    RedisTemplate<String, String> redisTemplate;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected  String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected  Long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected  Long REFRESHABLE_DURATION;
    public String generateAccessToken(User user) {
        return generateToken(user, "access", VALID_DURATION);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, "refresh", REFRESHABLE_DURATION);
    }
    private String generateToken(User user, String type, long validitySeconds) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("luattoto.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validitySeconds, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("type", type)
                .claim("scope", user.getRole())
                .build();

        try {
            JWSObject jwsObject = new JWSObject(jwsHeader, new Payload(claimsSet.toJSONObject()));
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Failed to sign JWT", e);
        }
    }
    @Override
    public SignedJWT verifyToken(String token, boolean allowExpired) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(token);

        // ✅ Kiểm tra chữ ký
        boolean verified = signedJWT.verify(new MACVerifier(SIGNER_KEY.getBytes()));
        if (!verified) {
            throw new RuntimeException("Invalid JWT signature");
        }

        // ✅ Kiểm tra thời gian hết hạn (nếu không cho phép expired)
        Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
        if (!allowExpired && expiry.before(new Date())) {
            throw new RuntimeException("Token has expired");
        }

        // ✅ Kiểm tra token có bị thu hồi không (logout)
        String jti = signedJWT.getJWTClaimsSet().getJWTID();
        String redisKey = "revoked:" + jti;

        Boolean isRevoked = redisTemplate.hasKey(redisKey);
        if (Boolean.TRUE.equals(isRevoked)) {
            throw new RuntimeException("Token has been revoked");
        }

        return signedJWT;
    }
    @Override
    public void saveRefreshToken(String userId, String refreshToken, long ttlSeconds) {
        redisTemplate.opsForValue().set("refresh:" + userId, refreshToken, ttlSeconds, TimeUnit.SECONDS);
    }
    @Override
    public void revokeAccessToken(String token) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        String jti = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
        long ttl = expiry.getTime() - System.currentTimeMillis();

        if (ttl > 0) {
            redisTemplate.opsForValue().set("revoked:" + jti, "true", ttl, TimeUnit.MILLISECONDS);
        }
    }
    @Override
    public void deleteRefreshToken(String userId) {
        redisTemplate.delete("refresh:" + userId);
    }
    public String getRefreshToken(String userId) {
        return redisTemplate.opsForValue().get("refresh:" + userId);
    }
}

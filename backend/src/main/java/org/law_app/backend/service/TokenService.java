package org.law_app.backend.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import java.text.ParseException;
import org.law_app.backend.entity.User;

public interface TokenService {
  String generateAccessToken(User user);

  String generateRefreshToken(User user);

  void saveRefreshToken(String userId, String refreshToken, long ttlSeconds);

  void revokeAccessToken(String token) throws ParseException, JOSEException;

  void deleteRefreshToken(String userId);

  String getRefreshToken(String userId);

  SignedJWT verifyToken(String token, boolean allowExpired) throws ParseException, JOSEException;
}

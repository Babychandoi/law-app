package org.law_app.backend.controller;

import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.text.ParseException;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.law_app.backend.dto.request.*;
import org.law_app.backend.dto.response.ApiMeta;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.AuthenticationResponse;
import org.law_app.backend.dto.response.IntrospectResponse;
import org.law_app.backend.dto.response.StaffDirectoryResponse;
import org.law_app.backend.common.ErrorCode;
import org.law_app.backend.dto.response.UserResponse;
import org.law_app.backend.security.CookieUtil;
import org.law_app.backend.service.AuthenticationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthenticationController {
  AuthenticationService authenticationService;
  CookieUtil cookieUtil;

  @PostMapping("/login")
  ApiResponse<AuthenticationResponse> authenticate(
      @RequestBody AuthenticationRequest request, HttpServletResponse response) {
    var result = authenticationService.authenticate(request);
    if (result.isAuthenticated()) {
      setAuthCookies(response, result.getToken(), result.getRefreshToken());
    }
    // Tokens go to httpOnly cookies only — never expose them in the JSON body to JS.
    stripTokens(result);
    return ApiResponse.<AuthenticationResponse>builder()
        .code(200)
        .data(result)
        .message(result.isAuthenticated() ? "Login successful" : "Login failed")
        .build();
  }

  /** Mint a short-lived token for the WebSocket/STOMP handshake (cookie auth can't reach STOMP). */
  @GetMapping("/ws-token")
  ApiResponse<String> wsToken() {
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    return ApiResponse.<String>builder().data(authenticationService.issueWsToken(userId)).build();
  }

  @PostMapping("/users")
  ApiResponse<UserResponse> createUser(@RequestBody UserRequest request) {
    var result = authenticationService.createUser(request);
    return ApiResponse.<UserResponse>builder()
        .data(result)
        .message("User created successfully")
        .build();
  }

  @PostMapping("/introspect")
  ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
      throws ParseException, JOSEException {
    var result = authenticationService.introspect(request);
    return ApiResponse.<IntrospectResponse>builder()
        .data(result)
        .message(result.isValid() ? "Token is valid" : "Token is invalid")
        .build();
  }

  @PostMapping("/logout")
  ApiResponse<Void> logout(
      @RequestBody(required = false) LogoutRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse response)
      throws ParseException, JOSEException {
    // Prefer the access-token cookie; fall back to the body for older clients.
    String token = readCookie(httpRequest, CookieUtil.ACCESS_COOKIE);
    if (token == null && request != null) {
      token = request.getToken();
    }
    if (token != null) {
      authenticationService.logout(LogoutRequest.builder().token(token).build());
    }
    response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.clearAccessCookie().toString());
    response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.clearRefreshCookie().toString());
    return ApiResponse.<Void>builder().message("Logout successful").build();
  }

  @PostMapping("/refresh")
  ApiResponse<AuthenticationResponse> authenticate(
      @RequestBody(required = false) RefreshRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse response)
      throws ParseException, JOSEException {
    // Prefer the refresh-token cookie (scoped to /auth); fall back to the body.
    String refreshToken = readCookie(httpRequest, CookieUtil.REFRESH_COOKIE);
    if (refreshToken == null && request != null) {
      refreshToken = request.getRefreshToken();
    }
    // No refresh token (e.g. not logged in) -> clean 401, not a 500 from JWT parsing.
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    var result =
        authenticationService.refreshToken(
            RefreshRequest.builder().refreshToken(refreshToken).build());
    setAuthCookies(response, result.getToken(), result.getRefreshToken());
    stripTokens(result);
    return ApiResponse.<AuthenticationResponse>builder().data(result).build();
  }

  /** Blank the token fields so they live only in httpOnly cookies, never in the JSON body. */
  private void stripTokens(AuthenticationResponse result) {
    result.setToken(null);
    result.setRefreshToken(null);
  }

  private void setAuthCookies(HttpServletResponse response, String access, String refresh) {
    response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.accessCookie(access).toString());
    response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.refreshCookie(refresh).toString());
  }

  private String readCookie(HttpServletRequest request, String name) {
    if (request.getCookies() == null) return null;
    for (Cookie c : request.getCookies()) {
      if (name.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
        return c.getValue();
      }
    }
    return null;
  }

  @GetMapping("/users")
  ApiResponse<List<UserResponse>> getUsers(
      @RequestParam(required = false) String q,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    Page<UserResponse> users = authenticationService.getUsers(q, pageable);
    return ApiResponse.<List<UserResponse>>builder()
        .data(users.getContent())
        .meta(ApiMeta.from(users))
        .message("Users retrieved successfully")
        .build();
  }

  // Danh bạ nhân sự cho chat nội bộ — mọi user đã đăng nhập (không giới hạn ADMIN).
  @GetMapping("/staff-directory")
  ApiResponse<List<StaffDirectoryResponse>> getStaffDirectory() {
    return ApiResponse.<List<StaffDirectoryResponse>>builder()
        .data(authenticationService.getStaffDirectory())
        .message("Staff directory retrieved successfully")
        .build();
  }

  @PutMapping("/users/{id}")
  ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody UserRequest request) {
    var result = authenticationService.updateUser(id, request);
    return ApiResponse.<UserResponse>builder()
        .data(result)
        .message("User updated successfully")
        .build();
  }

  @PutMapping("/users/{id}/password")
  ApiResponse<Boolean> changePassword(
      @PathVariable String id, @RequestBody ChangePasswordRequest request) {
    var result = authenticationService.changePassword(id, request.getNewPassword());
    return ApiResponse.<Boolean>builder()
        .data(result)
        .message(result ? "Password changed successfully" : "Password change failed")
        .build();
  }

  @PutMapping("/users/{id}/role")
  ApiResponse<Boolean> changeRole(@PathVariable String id, @RequestParam Role role) {
    var result = authenticationService.changeRole(id, role);
    return ApiResponse.<Boolean>builder()
        .data(result)
        .message(result ? "Role changed successfully" : "Role change failed")
        .build();
  }

  @PutMapping("/users/{id}/active")
  ApiResponse<Boolean> changeActive(@PathVariable String id, @RequestParam Active active) {
    var result = authenticationService.changeActive(id, active);
    return ApiResponse.<Boolean>builder()
        .data(result)
        .message(result ? "User status changed successfully" : "User status change failed")
        .build();
  }

  @GetMapping("/me")
  ApiResponse<UserResponse> getMyAccount() {
    var context = SecurityContextHolder.getContext();
    String id = context.getAuthentication().getName();
    return ApiResponse.<UserResponse>builder()
        .data(authenticationService.myProfile(id))
        .message("My account retrieved successfully")
        .build();
  }
}

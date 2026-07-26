package org.law_app.chat.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * The staff directory lives in the monolith. We proxy {@code GET /auth/staff-directory}, forwarding
 * the caller's JWT, instead of duplicating the user table — accepted light coupling for the MVP.
 * (Dùng endpoint danh bạ tối giản cho MỌI user đã đăng nhập; KHÔNG dùng /auth/users vì đó là
 * endpoint quản lý người dùng chỉ ADMIN — nhân viên gọi sẽ bị 403 -> chat 502.)
 */
@Slf4j
@Service
public class StaffDirectoryService {

  private final RestClient restClient;

  public StaffDirectoryService(@Value("${monolith.base-url}") String monolithBaseUrl) {
    this.restClient = RestClient.builder().baseUrl(monolithBaseUrl).build();
  }

  public List<StaffUser> listStaff(String bearerToken) {
    try {
      ApiEnvelope<List<StaffUser>> resp =
          restClient
              .get()
              .uri("/auth/staff-directory")
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken)
              .retrieve()
              .body(new ParameterizedTypeReference<ApiEnvelope<List<StaffUser>>>() {});
      return resp == null || resp.data() == null ? List.of() : resp.data();
    } catch (Exception e) {
      log.error("Failed to fetch staff directory from monolith: {}", e.getMessage());
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot reach staff directory");
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record StaffUser(
      String id, String username, String fullName, String role, String position, String email) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record ApiEnvelope<T>(int code, String message, T data) {}
}

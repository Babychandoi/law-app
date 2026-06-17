package org.law_app.crm.service;

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

/** Staff directory proxied from the monolith ({@code GET /auth/users}), forwarding the JWT. */
@Slf4j
@Service
public class StaffDirectoryService {

  private final RestClient restClient;

  public StaffDirectoryService(@Value("${monolith.base-url}") String monolithBaseUrl) {
    this.restClient = RestClient.builder().baseUrl(monolithBaseUrl).build();
  }

  /** Ask the monolith to create an in-app notification for the assignee (best-effort). */
  public void notifyCaseAssigned(String token, String userId, String caseId, String serviceName) {
    try {
      restClient
          .post()
          .uri("/notifications/assign-case")
          .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
          .body(new AssignNotify(userId, caseId, serviceName))
          .retrieve()
          .toBodilessEntity();
    } catch (Exception e) {
      log.error("Failed to notify case assignment to {}: {}", userId, e.getMessage());
    }
  }

  public record AssignNotify(String userId, String caseId, String serviceName) {}

  public List<StaffUser> listStaff(String token) {
    try {
      ApiEnvelope<List<StaffUser>> resp =
          restClient
              .get()
              .uri("/auth/users")
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
              .retrieve()
              .body(new ParameterizedTypeReference<ApiEnvelope<List<StaffUser>>>() {});
      return resp == null || resp.data() == null ? List.of() : resp.data();
    } catch (Exception e) {
      log.error("Failed to fetch staff directory: {}", e.getMessage());
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot reach staff directory");
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record StaffUser(
      String id, String username, String fullName, String role, String position, String email) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record ApiEnvelope<T>(int code, String message, T data) {}
}

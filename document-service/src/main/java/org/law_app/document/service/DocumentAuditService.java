package org.law_app.document.service;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentAuditEvent;
import org.law_app.document.repository.DocumentAuditEventRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.AuditEventResponse;
import org.law_app.document.web.Dtos.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentAuditService {
  public static final String TEMPLATE = "TEMPLATE";
  public static final String GENERATED_DOCUMENT = "GENERATED_DOCUMENT";

  private final DocumentAuditEventRepository repository;

  public void record(
      String entityType,
      String entityId,
      String action,
      String fromStatus,
      String toStatus,
      Map<String, String> metadata) {
    repository.save(
        DocumentAuditEvent.builder()
            .entityType(entityType)
            .entityId(entityId)
            .action(action)
            .actorUserId(CurrentUser.id())
            .fromStatus(fromStatus)
            .toStatus(toStatus)
            .metadata(safeMetadata(metadata))
            .build());
  }

  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public PageResponse<AuditEventResponse> list(
      String entityType, String entityId, int page, int size) {
    int safeSize = Math.min(Math.max(size, 1), 100);
    int safePage = Math.max(page, 0);
    var result =
        repository.findByEntityTypeAndEntityId(
            entityType,
            entityId,
            PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    return new PageResponse<>(
        result.stream().map(this::toResponse).toList(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages(),
        result.isFirst(),
        result.isLast());
  }

  private Map<String, String> safeMetadata(Map<String, String> metadata) {
    Map<String, String> result = new LinkedHashMap<>();
    if (metadata == null) return result;
    metadata.forEach(
        (key, value) -> {
          if (key == null || value == null || result.size() >= 50) return;
          result.put(limit(key, 100), limit(value, 500));
        });
    return result;
  }

  private String limit(String value, int maxLength) {
    return value.length() <= maxLength ? value : value.substring(0, maxLength);
  }

  private AuditEventResponse toResponse(DocumentAuditEvent event) {
    return new AuditEventResponse(
        event.getId(),
        event.getEntityType(),
        event.getEntityId(),
        event.getAction(),
        event.getActorUserId(),
        event.getFromStatus(),
        event.getToStatus(),
        event.getMetadata(),
        event.getCreatedAt());
  }
}

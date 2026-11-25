package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.blankToDefault;
import static org.law_app.crm.service.CrmSupport.currentActorId;
import static org.law_app.crm.service.CrmSupport.currentActorName;
import static org.law_app.crm.service.CrmSupport.hasText;
import static org.law_app.crm.service.CrmSupport.newId;
import static org.law_app.crm.service.CrmSupport.trimOrNull;

import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmActivity;
import org.law_app.crm.repository.CrmActivityRepository;
import org.law_app.crm.repository.CrmLeadRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.ActivityCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmActivityDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmActivityService {

  private final CrmActivityRepository activityRepo;
  private final CrmLeadRepository leadRepo;

  @Transactional(readOnly = true)
  public List<CrmActivityDto> list(String entityType, String entityId) {
    List<CrmActivity> rows;
    if (hasText(entityId)) {
      if (hasText(entityType)) {
        rows =
            activityRepo.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                entityType.trim().toUpperCase(), entityId.trim());
      } else {
        rows = activityRepo.findByEntityIdOrderByCreatedAtDesc(entityId.trim());
      }
    } else if (hasText(entityType)) {
      rows =
          activityRepo.findTop50ByEntityTypeOrderByCreatedAtDesc(entityType.trim().toUpperCase());
    } else {
      rows = activityRepo.findTop50ByOrderByCreatedAtDesc();
    }
    return rows.stream().map(this::toDto).toList();
  }

  @Transactional
  public CrmActivityDto create(ActivityCreateRequest req) {
    if (!hasText(req.entityId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "entityId is required");
    }
    Instant now = Instant.now();
    String entityType = blankToDefault(req.entityType(), "LEAD").toUpperCase();
    String activityType = blankToDefault(req.activityType(), "NOTE").toUpperCase();

    CrmActivity activity =
        CrmActivity.builder()
            .id(newId())
            .entityType(entityType)
            .entityId(req.entityId().trim())
            .activityType(activityType)
            .title(blankToDefault(req.title(), "Hoạt động chăm sóc"))
            .content(trimOrNull(req.content()))
            .dueAt(req.dueAt())
            .completed(Boolean.TRUE.equals(req.completed()))
            .createdBy(currentActorId())
            .createdByName(
                hasText(req.createdByName()) ? req.createdByName().trim() : currentActorName())
            .createdAt(now)
            .build();

    CrmActivity saved = activityRepo.save(activity);

    if ("LEAD".equals(entityType)) {
      leadRepo
          .findById(req.entityId().trim())
          .ifPresent(
              lead -> {
                lead.setLastInteractedAt(now);
                lead.setUpdatedAt(now);
                leadRepo.save(lead);
              });
    }

    return toDto(saved);
  }

  @Transactional
  public CrmActivityDto toggleComplete(String id) {
    CrmActivity activity =
        activityRepo
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    activity.setCompleted(!activity.isCompleted());
    return toDto(activityRepo.save(activity));
  }

  @Transactional
  public void delete(String id) {
    CrmActivity activity =
        activityRepo
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    activityRepo.delete(activity);
  }

  private CrmActivityDto toDto(CrmActivity a) {
    return new CrmActivityDto(
        a.getId(),
        a.getEntityType(),
        a.getEntityId(),
        a.getActivityType(),
        a.getTitle(),
        a.getContent(),
        a.getDueAt(),
        a.isCompleted(),
        a.getCreatedBy(),
        a.getCreatedByName(),
        a.getCreatedAt());
  }
}

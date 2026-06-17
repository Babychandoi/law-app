package org.law_app.crm.web;

import jakarta.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;

/** Request/response DTOs for the CRM operational API. */
public final class CrmDtos {
  private CrmDtos() {}

  /** A row in the advanced-filter result table. */
  public record CaseRow(
      String id,
      String customerEmail,
      String customerPhone,
      String serviceName,
      String name,
      String status,
      String assignedUserId,
      Long careStatusId,
      Date nextFollowUpAt,
      java.time.Instant lastCaredAt,
      Long lastCareResultId,
      List<Long> tagIds,
      Date caseCreatedAt) {}

  /** Record a care interaction. */
  public record CareLogRequest(
      @NotNull Long actionId,
      Long resultId,
      Long newStatusId,
      String note,
      Date followUpAt,
      List<Long> addTagIds) {}

  public record AssignRequest(String userId) {}

  public record TagsRequest(List<Long> tagIds) {}
}

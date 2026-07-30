package org.law_app.document.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentBundle;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentWorkflowStatus;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.web.Dtos.DocumentStatsResponse;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

/** Thống kê khối lượng tài liệu (mẫu, tài liệu sinh ra theo trạng thái, bộ mẫu) cho dashboard. */
@Service
@RequiredArgsConstructor
public class DocumentStatsService {

  private final MongoTemplate mongoTemplate;

  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DocumentStatsResponse stats() {
    Map<String, Long> templatesByStatus = new LinkedHashMap<>();
    for (DocumentTemplateStatus status : DocumentTemplateStatus.values()) {
      templatesByStatus.put(status.name(), countByStatus(status.name(), DocumentTemplate.class));
    }
    long templatesTotal = sum(templatesByStatus);

    Map<String, Long> generatedByStatus = new LinkedHashMap<>();
    for (DocumentWorkflowStatus status : DocumentWorkflowStatus.values()) {
      generatedByStatus.put(status.name(), countByStatus(status.name(), GeneratedDocument.class));
    }
    long generatedTotal = sum(generatedByStatus);

    long generatedLast30Days =
        mongoTemplate.count(
            Query.query(Criteria.where("createdAt").gte(Instant.now().minus(30, ChronoUnit.DAYS))),
            GeneratedDocument.class);
    long bundlesActive = countByStatus(DocumentTemplateStatus.ACTIVE.name(), DocumentBundle.class);

    return new DocumentStatsResponse(
        templatesTotal,
        templatesByStatus,
        generatedTotal,
        generatedByStatus,
        generatedLast30Days,
        bundlesActive);
  }

  private long countByStatus(String status, Class<?> entity) {
    return mongoTemplate.count(Query.query(Criteria.where("status").is(status)), entity);
  }

  private static long sum(Map<String, Long> counts) {
    return counts.values().stream().mapToLong(Long::longValue).sum();
  }
}

package org.law_app.backend.event;

import java.time.Instant;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event payload describing a CustomerService ("case") for the CRM read-replica. Carries enough to
 * fully upsert the CRM-side row without the CRM calling back. Routing keys: {@code case.created},
 * {@code case.statusChanged}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseEvent {
  private String eventId;

  @Builder.Default private int schemaVersion = 1;

  private Instant occurredAt;
  private String caseId;
  private String customerId;
  private String customerEmail;
  private String customerPhone;
  private String serviceId;
  private String serviceName;
  private String name;
  private String description;
  private String status; // Status enum name
  private Date createdAt;
  private Date updatedAt;
  private Date completedAt;
  private Date canceledAt;
}

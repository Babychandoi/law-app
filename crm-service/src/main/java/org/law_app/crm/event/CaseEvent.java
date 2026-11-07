package org.law_app.crm.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.Date;
import lombok.Data;

/** Mirrors the monolith's CaseEvent payload. */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CaseEvent {
  private String eventId;
  private int schemaVersion;
  private Instant occurredAt;
  private String caseId;
  private String customerId;
  private String customerEmail;
  private String customerPhone;
  private String serviceId;
  private String serviceName;
  private String name;
  private String description;
  private String status;
  private Date createdAt;
  private Date updatedAt;
  private Date completedAt;
  private Date canceledAt;
}

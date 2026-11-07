package org.law_app.document.domain;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * References a document back to its legal matter without copying customer PII into logs or search
 * fields. IDs remain opaque so the CRM stays the system of record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LegalDocumentContext {
  private String crmCaseId;
  private String customerId;
  private String serviceId;
  private String serviceName;
  private String dossierId;
  private String matterReference;
  @Builder.Default private Map<String, String> sourceReferences = new LinkedHashMap<>();
}

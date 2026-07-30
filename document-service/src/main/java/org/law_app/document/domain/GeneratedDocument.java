package org.law_app.document.domain;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "generated_documents")
@CompoundIndex(
    name = "idx_generated_owner_created",
    def = "{'createdByUserId': 1, 'createdAt': -1}")
@CompoundIndex(name = "idx_generated_template_created", def = "{'templateId': 1, 'createdAt': -1}")
@CompoundIndex(
    name = "idx_generated_case_created",
    def = "{'context.crmCaseId': 1, 'createdAt': -1}")
@CompoundIndex(
    name = "idx_generated_customer_created",
    def = "{'context.customerId': 1, 'createdAt': -1}")
@CompoundIndex(
    name = "idx_generated_service_created",
    def = "{'context.serviceId': 1, 'createdAt': -1}")
@CompoundIndex(name = "idx_generated_status_updated", def = "{'status': 1, 'updatedAt': -1}")
public class GeneratedDocument {
  @Id private String id;

  @Indexed private String templateId;
  @Indexed private String templateVersionId;
  private String templateNameSnapshot;
  private int templateVersionSnapshot;
  private String templateContentSha256;
  private String generatedFileName;
  private String generatedObjectName;
  private String generatedBucket;
  private String generatedContentSha256;

  /** Legacy plaintext field; new writes keep this empty and use encryptedValues. */
  @Builder.Default private Map<String, String> values = new LinkedHashMap<>();

  private String encryptedValues;
  private String encryptionAlgorithm;
  private String encryptionKeyId;
  private Instant encryptedAt;
  @Builder.Default private LegalDocumentContext context = new LegalDocumentContext();

  @Builder.Default private DocumentWorkflowStatus status = DocumentWorkflowStatus.DRAFT;
  private String reviewerUserId;
  private String approvedByUserId;
  private String finalizedByUserId;
  private String voidedByUserId;

  /** Legacy workflow reason; new writes use encryptedWorkflowReason. */
  private String rejectionReason;

  private String encryptedWorkflowReason;
  private String workflowReasonEncryptionAlgorithm;
  private String workflowReasonEncryptionKeyId;
  private Instant workflowReasonEncryptedAt;
  private Instant submittedAt;
  private Instant approvedAt;
  private Instant finalizedAt;
  private Instant voidedAt;

  @Indexed(unique = true, partialFilter = "{ 'idempotencyScope': { $type: 'string' } }")
  private String idempotencyScope;

  private String requestFingerprint;

  @Indexed private String createdByUserId;
  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
  @Version private Long revision;
}

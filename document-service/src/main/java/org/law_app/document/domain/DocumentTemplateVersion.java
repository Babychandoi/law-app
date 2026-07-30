package org.law_app.document.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Immutable content snapshot. A version is never updated after insertion; lifecycle pointers live
 * on {@link DocumentTemplate}. This guarantees that an already-generated document always resolves
 * to the exact bytes and field schema used at generation time.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_template_versions")
@CompoundIndex(
    name = "uk_template_version_number",
    def = "{'templateId': 1, 'versionNumber': 1}",
    unique = true)
@CompoundIndex(name = "idx_template_versions_created", def = "{'templateId': 1, 'createdAt': -1}")
public class DocumentTemplateVersion {
  @Id private String id;

  @Indexed private String templateId;
  private int versionNumber;
  private String previousVersionId;

  private String name;
  private String description;
  private String originalFileName;
  private String templateObjectName;
  private String templateBucket;
  private String contentType;
  private long fileSize;
  private String contentSha256;

  @Builder.Default private List<DocumentTemplateField> fields = new ArrayList<>();
  private String serviceId;
  private String serviceName;
  @Builder.Default private List<String> tags = new ArrayList<>();

  private String changeReason;
  private Instant effectiveFrom;
  @Indexed private String createdByUserId;
  @CreatedDate private Instant createdAt;
}

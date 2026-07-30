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
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_templates")
@CompoundIndex(name = "idx_template_status_updated", def = "{'status': 1, 'updatedAt': -1}")
@CompoundIndex(name = "idx_template_service_updated", def = "{'serviceId': 1, 'updatedAt': -1}")
public class DocumentTemplate {
  @Id private String id;

  private String name;
  private String description;

  @Indexed private DocumentTemplateStatus status;

  @Builder.Default private int version = 1;
  private String latestVersionId;
  private String activeVersionId;
  @Builder.Default private boolean hasUnpublishedChanges = true;
  private String originalFileName;
  private String templateObjectName;
  private String templateBucket;
  private String contentType;
  private long fileSize;
  private String contentSha256;

  @Builder.Default private List<DocumentTemplateField> fields = new ArrayList<>();

  @Indexed private String serviceId;
  private String serviceName;
  @Builder.Default private List<String> tags = new ArrayList<>();

  @Indexed private String createdByUserId;
  private String updatedByUserId;
  private String publishedByUserId;
  private Instant publishedAt;
  private String archivedByUserId;
  private Instant archivedAt;
  private Instant effectiveFrom;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
  @Version private Long revision;
}

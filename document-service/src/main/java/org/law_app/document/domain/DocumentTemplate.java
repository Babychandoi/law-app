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
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_templates")
public class DocumentTemplate {
  @Id private String id;

  private String name;
  private String description;

  @Indexed private DocumentTemplateStatus status;

  @Builder.Default private int version = 1;
  private String originalFileName;
  private String templateObjectName;
  private String templateBucket;
  private String contentType;
  private long fileSize;

  @Builder.Default private List<DocumentTemplateField> fields = new ArrayList<>();

  @Indexed private String createdByUserId;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}

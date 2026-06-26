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
public class GeneratedDocument {
  @Id private String id;

  @Indexed private String templateId;
  private String templateNameSnapshot;
  private int templateVersionSnapshot;
  private String generatedFileName;
  private String generatedObjectName;
  private String generatedBucket;

  @Builder.Default private Map<String, String> values = new LinkedHashMap<>();

  @Indexed private String createdByUserId;
  @CreatedDate private Instant createdAt;
}

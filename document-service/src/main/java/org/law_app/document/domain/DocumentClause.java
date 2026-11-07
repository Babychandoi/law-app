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

/**
 * Điều khoản tái dùng trong thư viện: đoạn văn mẫu (tiêu đề + nội dung + tag/nhóm) để chèn nhanh
 * vào file Word mẫu; kết hợp cơ chế điều kiện ${if_KEY} để bật/tắt trong tài liệu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_clauses")
@CompoundIndex(name = "idx_clause_status_updated", def = "{'status': 1, 'updatedAt': -1}")
public class DocumentClause {
  @Id private String id;

  private String title;
  private String content;
  private String category;
  @Builder.Default private List<String> tags = new ArrayList<>();

  @Indexed private DocumentTemplateStatus status;

  @Indexed private String createdByUserId;
  private String updatedByUserId;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
  @Version private Long revision;
}

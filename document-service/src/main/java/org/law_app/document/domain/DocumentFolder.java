package org.law_app.document.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

/** Thư mục tổ chức biểu mẫu (phẳng, một cấp) — nhóm mẫu theo lĩnh vực/dịch vụ để dễ quản lý. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_folders")
public class DocumentFolder {
  @Id private String id;

  private String name;

  private String createdByUserId;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
  @Version private Long revision;
}

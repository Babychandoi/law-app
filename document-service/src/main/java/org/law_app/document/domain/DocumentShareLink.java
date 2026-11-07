package org.law_app.document.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Link chia sẻ bảo mật cho một tài liệu đã tạo: token băm (không lưu token thô), có hạn dùng và
 * giới hạn lượt tải. Token thô chỉ trả về một lần khi tạo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_share_links")
public class DocumentShareLink {
  @Id private String id;

  @Indexed(unique = true)
  private String tokenHash;

  @Indexed private String generatedDocumentId;
  private Instant expiresAt;
  private Integer maxDownloads;
  @Builder.Default private int downloadCount = 0;
  @Builder.Default private boolean revoked = false;

  private String createdByUserId;
  @CreatedDate private Instant createdAt;
}

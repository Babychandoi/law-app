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
 * Bộ mẫu tài liệu (template set) của một dịch vụ: danh sách mẫu có thứ tự để sinh trọn bộ hồ sơ
 * trong một lần, dùng chung dữ liệu ngữ cảnh (CRM case/khách hàng).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_bundles")
@CompoundIndex(name = "idx_bundle_status_updated", def = "{'status': 1, 'updatedAt': -1}")
public class DocumentBundle {
  @Id private String id;

  private String name;
  private String description;

  @Indexed private DocumentTemplateStatus status;

  @Indexed private String serviceId;
  private String serviceName;
  @Builder.Default private List<String> tags = new ArrayList<>();

  @Builder.Default private List<BundleItem> items = new ArrayList<>();

  @Indexed private String createdByUserId;
  private String updatedByUserId;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
  @Version private Long revision;

  /** Một mẫu trong bộ, kèm thứ tự sinh và có bắt buộc hay không. */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BundleItem {
    private String templateId;
    private int sortOrder;
    @Builder.Default private boolean required = true;
  }
}

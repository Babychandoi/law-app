package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Date;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

/** Cấu hình riêng của một landing page (không gồm nội dung thân trang). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LandingPageResponse {
  String id;
  String slug;
  boolean published;

  /** Dịch vụ thu lead — id này là serviceId gửi kèm khi khách điền form. */
  String serviceId;

  String serviceTitle;
  String serviceHref;

  String eyebrow;
  List<String> heroPoints;
  String formTitle;
  String formSubtitle;
  String finalCtaTitle;
  String finalCtaSubtitle;

  Date updatedAt;
}

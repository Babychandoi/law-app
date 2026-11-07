package org.law_app.backend.dto.request;

import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

/** Payload tạo/sửa landing page. Khi sửa, serviceId bị bỏ qua — landing không đổi dịch vụ. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LandingPageRequest {
  String serviceId;
  String slug;
  Boolean published;
  String eyebrow;
  List<String> heroPoints;
  String formTitle;
  String formSubtitle;
  String finalCtaTitle;
  String finalCtaSubtitle;
}

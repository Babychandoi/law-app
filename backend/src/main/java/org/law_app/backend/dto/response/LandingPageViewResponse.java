package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Dữ liệu render một landing page public: cấu hình landing + toàn bộ nội dung trang dịch vụ tương
 * ứng, trả trong một lần gọi để trang ads không phải chờ hai request nối tiếp.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LandingPageViewResponse {
  LandingPageResponse landing;
  ServicePageResponse page;
}

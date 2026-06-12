package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

/** Toàn bộ nội dung một trang dịch vụ — frontend render trong 1 lần gọi. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServicePageResponse {
  String id;
  String title;
  String href;
  String description;
  String image;
  HeroResponse hero;
  List<ServiceSectionResponse> sections;
  List<ProcessResponse> process;
  List<PricingResponse> pricing;
}

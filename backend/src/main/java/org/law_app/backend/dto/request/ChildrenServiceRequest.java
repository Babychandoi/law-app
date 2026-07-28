package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChildrenServiceRequest {
  String title;
  String href;
  String description;
  String icon;
  String image;
  String descriptionHome;

  /** id của Services cha (nhóm dịch vụ) */
  String parentServiceId;
}

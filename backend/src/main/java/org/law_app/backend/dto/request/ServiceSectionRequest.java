package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceSectionRequest {
  String type;
  String title;
  String subtitle;
  String content;
  String image;
  Integer sortOrder;
  List<Item> items;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Item {
    String title;
    String description;
    String secondary;
    String icon;
    String image;
    Integer sortOrder;
  }
}

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
public class PricingRequest {
  String title;
  String description;
  String price;
  String image;
  String currency;
  String serviceId;
  boolean featured;
  List<String> features;
}

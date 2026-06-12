package org.law_app.backend.dto.response;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobResponse {
  String id;

  String title;

  String company;

  String jobType;

  String location;

  Date postedDate;

  List<String> description;

  List<String> requirements;

  List<String> benefits;

  String category;
}

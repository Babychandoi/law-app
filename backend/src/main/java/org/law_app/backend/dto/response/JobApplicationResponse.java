package org.law_app.backend.dto.response;

import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobApplicationResponse {
  String id;
  String jobId;
  String jobTitle;
  String candidateName;
  String candidateEmail;
  String candidatePhone;
  String cvFileUrl;
  String cvFileName;
  String status;
  Date appliedDate;
  String notes;
}

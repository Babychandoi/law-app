package org.law_app.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobApplicationRequest {
    String jobId;
    String jobTitle;
    String candidateName;
    String candidateEmail;
    String candidatePhone;
}

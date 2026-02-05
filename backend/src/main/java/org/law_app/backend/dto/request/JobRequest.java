package org.law_app.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobRequest {
    String title;

    String company;

    String jobType;

    String location;

    List<String> description;

    List<String> requirements;

    List<String> benefits;

    String category;
}

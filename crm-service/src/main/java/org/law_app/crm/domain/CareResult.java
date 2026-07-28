package org.law_app.crm.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Outcome of a care interaction; can suggest the next care status. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crm_care_result")
public class CareResult {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String code;
  private String description;
  private Long suggestedStatusId; // CareStatus suggested after this result
  private boolean requireFollowUpDate;
  private Integer sortOrder;
  @Builder.Default private boolean active = true;
}

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

/** Manual care workflow status (configurable per workspace). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crm_care_status")
public class CareStatus {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String code;
  private String color;
  private String description;
  private Integer sortOrder;
  private boolean isDefault;
  private boolean isClosed; // terminal status
  private boolean requireFollowUpDate;
  @Builder.Default private boolean active = true;
}

package org.law_app.crm.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Case ↔ Tag link (a case can have many tags). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_case_tag",
    uniqueConstraints =
        @UniqueConstraint(name = "uq_case_tag", columnNames = {"case_id", "tag_id"}),
    indexes = @Index(name = "idx_case_tag_tag", columnList = "tag_id"))
public class CaseTag {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String caseId;
  private Long tagId;
}

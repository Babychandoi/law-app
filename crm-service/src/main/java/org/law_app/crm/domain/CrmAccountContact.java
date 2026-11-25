package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_account_contact",
    indexes = {
      @Index(name = "idx_crm_account_contact_account", columnList = "account_id, created_at")
    })
public class CrmAccountContact {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "account_id", length = 36, nullable = false)
  private String accountId;

  @Column(length = 255)
  private String fullName;

  @Column(length = 255)
  private String jobTitle;

  @Column(length = 64)
  private String phone;

  @Column(length = 255)
  private String email;

  private LocalDate birthDate;

  private boolean primaryContact;

  @Column(name = "created_at")
  private Instant createdAt;
}

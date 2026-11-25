package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
    name = "crm_contract_cashflow",
    indexes = {
      @Index(
          name = "idx_crm_contract_cashflow_contract",
          columnList = "contract_id, type, transaction_date")
    })
public class CrmContractCashflow {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "contract_id", length = 36, nullable = false)
  private String contractId;

  @Column(name = "type", length = 32, nullable = false)
  private String type;

  @Column(length = 150)
  private String category;

  @Column(length = 2000)
  private String description;

  @Column(precision = 19, scale = 2, nullable = false)
  private BigDecimal amount;

  @Column(name = "transaction_date")
  private LocalDate transactionDate;

  @Column(length = 100)
  private String paymentMethod;

  @Column(length = 120)
  private String referenceCode;

  @Column(length = 100)
  private String status;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 255)
  private String createdByName;

  @Column(name = "created_at")
  private Instant createdAt;
}

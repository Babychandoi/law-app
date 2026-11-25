package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
    name = "crm_opportunity_item",
    indexes = {@Index(name = "idx_crm_opp_item_opp", columnList = "opportunity_id, sort_order")})
public class CrmOpportunityItem {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "opportunity_id", length = 36, nullable = false)
  private String opportunityId;

  @Column(name = "sort_order")
  private int sortOrder;

  @Column(length = 64)
  private String itemCode;

  @Column(length = 1000)
  private String description;

  @Column(length = 120)
  private String warehouse;

  @Column(length = 64)
  private String unit;

  @Column(precision = 19, scale = 2)
  private BigDecimal quantity;

  @Column(precision = 19, scale = 2)
  private BigDecimal deliveredQuantity;

  @Column(precision = 19, scale = 2)
  private BigDecimal unitPrice;

  @Column(precision = 19, scale = 2)
  private BigDecimal amount;

  @Column(precision = 19, scale = 2)
  private BigDecimal tradeDiscount;

  @Column(precision = 19, scale = 2)
  private BigDecimal discountRate;

  @Column(precision = 19, scale = 2)
  private BigDecimal discountAmount;

  @Column(length = 32)
  private String vatRate;

  @Column(precision = 19, scale = 2)
  private BigDecimal vatAmount;

  @Column(precision = 19, scale = 2)
  private BigDecimal totalAmount;

  @Column(length = 64)
  private String parentContractNumber;

  @Column(length = 64)
  private String promotionCode;

  private boolean freeItem;
}

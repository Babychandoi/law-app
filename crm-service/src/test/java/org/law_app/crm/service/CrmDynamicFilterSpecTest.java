package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.law_app.crm.service.CrmSupport.endExclusiveInstant;
import static org.law_app.crm.service.CrmSupport.startOfDayInstant;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmContract;
import org.law_app.crm.domain.CrmLead;
import org.law_app.crm.domain.CrmOpportunity;
import org.law_app.crm.service.CrmDynamicFilterSpec.FieldDef;
import org.law_app.crm.service.CrmDynamicFilterSpec.FilterRule;
import org.mockito.Answers;

@SuppressWarnings({"unchecked", "rawtypes"})
class CrmDynamicFilterSpecTest {

  private static final LocalDate REF_WEDNESDAY = LocalDate.of(2026, 11, 25);

  @Test
  void parseRulesHandlesValidBlankAndMalformedJsonGracefully() {
    assertThat(CrmDynamicFilterSpec.parseRules(null)).isEmpty();
    assertThat(CrmDynamicFilterSpec.parseRules("")).isEmpty();
    assertThat(CrmDynamicFilterSpec.parseRules("   ")).isEmpty();
    assertThat(CrmDynamicFilterSpec.parseRules("[]")).isEmpty();
    assertThat(CrmDynamicFilterSpec.parseRules("{not-an-array}")).isEmpty();
    assertThat(CrmDynamicFilterSpec.parseRules("[malformed json")).isEmpty();

    String json =
        """
        [
          {"id":"r1","field":"contractNumber","op":"CONTAINS","value":"PD26","extra":123},
          {"field":"orderValue","op":"BETWEEN","value":"1000000","valueTo":"5000000"},
          {"field":"","op":"EQ","value":"ignored"},
          {"field":"shared","op":""}
        ]
        """;
    List<FilterRule> rules = CrmDynamicFilterSpec.parseRules(json);
    assertThat(rules).hasSize(2);
    assertThat(rules.get(0)).isEqualTo(new FilterRule("contractNumber", "CONTAINS", "PD26", null));
    assertThat(rules.get(1))
        .isEqualTo(new FilterRule("orderValue", "BETWEEN", "1000000", "5000000"));
  }

  @Test
  void allWhitelistedEntityFieldsMatchJavaDomainClassesAndTypes() throws NoSuchFieldException {
    verifyWhitelistMatchesEntity(CrmContract.class, CrmDynamicFilterSpec.CONTRACT_FIELDS);
    verifyWhitelistMatchesEntity(CrmLead.class, CrmDynamicFilterSpec.LEAD_FIELDS);
    verifyWhitelistMatchesEntity(CrmAccount.class, CrmDynamicFilterSpec.ACCOUNT_FIELDS);
    verifyWhitelistMatchesEntity(CrmOpportunity.class, CrmDynamicFilterSpec.OPPORTUNITY_FIELDS);

    assertThat(CrmDynamicFilterSpec.CONTRACT_FIELDS)
        .containsKeys(
            "bookingDate",
            "paymentDate",
            "goodsSummary",
            "revenueStatus",
            "executionStatus",
            "contractNumber",
            "orderValue",
            "receivableAmount",
            "estimatedProfit",
            "shared",
            "syncPriceAfterDiscount",
            "createdAt");
    assertThat(CrmDynamicFilterSpec.LEAD_FIELDS)
        .containsKeys("tags", "serviceGroups", "birthDate", "shared", "lastInteractedAt");
    assertThat(CrmDynamicFilterSpec.ACCOUNT_FIELDS)
        .containsKeys(
            "careStatuses", "industries", "annualRevenue", "individual", "partner", "foundedDate");
    assertThat(CrmDynamicFilterSpec.OPPORTUNITY_FIELDS)
        .containsKeys("opportunityTypes", "expectedRevenue", "expectedCloseDate", "stage");
  }

  private void verifyWhitelistMatchesEntity(Class<?> entityClass, Map<String, FieldDef> whitelist)
      throws NoSuchFieldException {
    for (Map.Entry<String, FieldDef> entry : whitelist.entrySet()) {
      FieldDef def = entry.getValue();
      Field field = entityClass.getDeclaredField(def.entityAttr());
      Class<?> expectedType =
          switch (def.kind()) {
            case STRING, JSON_LIST -> String.class;
            case DECIMAL -> BigDecimal.class;
            case LOCAL_DATE -> LocalDate.class;
            case INSTANT -> Instant.class;
            case BOOLEAN -> boolean.class;
          };
      assertThat(field.getType())
          .as(
              "Entity %s field %s kind %s",
              entityClass.getSimpleName(), def.entityAttr(), def.kind())
          .isEqualTo(expectedType);
    }
  }

  @Test
  void nonWhitelistedFieldsAreIgnoredWithoutAccessingRoot() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmLead> root = mock(Root.class, Answers.RETURNS_MOCKS);

    List<FilterRule> rules =
        List.of(
            new FilterRule("nonExistentSecret", "EQ", "admin", null),
            new FilterRule("sqlInjection; DROP TABLE", "CONTAINS", "x", null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(rules, CrmDynamicFilterSpec.LEAD_FIELDS, root, cb);

    assertThat(predicates).isEmpty();
    verify(root, never()).get(any(String.class));
  }

  @Test
  void buildsStringPredicatesAcrossAllOperators() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmLead> root = mock(Root.class);
    Path<String> col = mock(Path.class);
    Expression<String> lowerCol = mock(Expression.class);
    Expression<String> trimCol = mock(Expression.class);
    when(root.get("customerName")).thenReturn((Path) col);
    when(cb.lower(col)).thenReturn(lowerCol);
    when(cb.trim(col)).thenReturn(trimCol);

    List<FilterRule> rules =
        List.of(
            new FilterRule("customerName", "CONTAINS", " Gokids ", null),
            new FilterRule("customerName", "NOT_CONTAINS", "Spam", null),
            new FilterRule("customerName", "EQ", "Trần Hà", null),
            new FilterRule("customerName", "NEQ", "Khác", null),
            new FilterRule("customerName", "STARTS_WITH", "Công ty", null),
            new FilterRule("customerName", "IS_EMPTY", null, null),
            new FilterRule("customerName", "NOT_EMPTY", null, null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(rules, CrmDynamicFilterSpec.LEAD_FIELDS, root, cb);

    assertThat(predicates).hasSize(7);
    verify(cb).like(lowerCol, "%gokids%");
    verify(cb).notLike(lowerCol, "%spam%");
    verify(cb).equal(lowerCol, "trần hà");
    verify(cb).notEqual(lowerCol, "khác");
    verify(cb).like(lowerCol, "công ty%");
    verify(cb).equal(trimCol, "");
    verify(cb).notEqual(trimCol, "");
    verify(cb).equal(col, "[]");
    verify(cb).notEqual(col, "[]");
  }

  @Test
  void buildsJsonListPredicatesMatchingSingleTagOrServiceGroup() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmLead> root = mock(Root.class);
    Path<String> col = mock(Path.class);
    Expression<String> lowerCol = mock(Expression.class);
    when(root.get("tags")).thenReturn((Path) col);
    when(cb.lower(col)).thenReturn(lowerCol);

    List<FilterRule> rules =
        List.of(
            new FilterRule("tags", "EQ", "VIP", null),
            new FilterRule("tags", "NEQ", "Gấp", null),
            new FilterRule("tags", "CONTAINS", "Nhãn hiệu", null),
            new FilterRule("tags", "IS_EMPTY", null, null),
            new FilterRule("tags", "NOT_EMPTY", null, null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(rules, CrmDynamicFilterSpec.LEAD_FIELDS, root, cb);

    assertThat(predicates).hasSize(5);
    verify(cb).like(lowerCol, "%\"vip\"%");
    verify(cb).notLike(lowerCol, "%\"gấp\"%");
    verify(cb).like(lowerCol, "%nhãn hiệu%");
  }

  @Test
  void buildsDecimalPredicatesWithStandardAndFormattedNumbers() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmContract> root = mock(Root.class);
    Path<BigDecimal> col = mock(Path.class);
    when(root.get("orderValue")).thenReturn((Path) col);

    List<FilterRule> rules =
        List.of(
            new FilterRule("orderValue", "EQ", "5.000.000", null),
            new FilterRule("orderValue", "NEQ", "1000000", null),
            new FilterRule("orderValue", "GT", "2 500 000", null),
            new FilterRule("orderValue", "GTE", "3000000", null),
            new FilterRule("orderValue", "LT", "9000000", null),
            new FilterRule("orderValue", "LTE", "8500000.50", null),
            new FilterRule("orderValue", "BETWEEN", "1.000.000", "10.000.000"),
            new FilterRule("orderValue", "BETWEEN", "2000000", null),
            new FilterRule("orderValue", "BETWEEN", null, "4000000"),
            new FilterRule("orderValue", "ZERO", null, null),
            new FilterRule("orderValue", "GT_ZERO", null, null),
            new FilterRule("orderValue", "IS_EMPTY", null, null),
            new FilterRule("orderValue", "NOT_EMPTY", null, null),
            new FilterRule("orderValue", "EQ", "not-a-number", null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(
            rules, CrmDynamicFilterSpec.CONTRACT_FIELDS, root, cb, REF_WEDNESDAY);

    assertThat(predicates).hasSize(13);
    verify(cb).equal(col, new BigDecimal("5000000"));
    verify(cb).notEqual(col, new BigDecimal("1000000"));
    verify(cb).greaterThan(col, new BigDecimal("2500000"));
    verify(cb).greaterThanOrEqualTo(col, new BigDecimal("3000000"));
    verify(cb).lessThan(col, new BigDecimal("9000000"));
    verify(cb).lessThanOrEqualTo(col, new BigDecimal("8500000.50"));
    verify(cb).between(col, new BigDecimal("1000000"), new BigDecimal("10000000"));
    verify(cb).greaterThanOrEqualTo(col, new BigDecimal("2000000"));
    verify(cb).lessThanOrEqualTo(col, new BigDecimal("4000000"));
    verify(cb).equal(col, BigDecimal.ZERO);
    verify(cb).greaterThan(col, BigDecimal.ZERO);
  }

  @Test
  void buildsLocalDatePredicatesWithRelativeAndExplicitDates() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmContract> root = mock(Root.class);
    Path<LocalDate> col = mock(Path.class);
    when(root.get("bookingDate")).thenReturn((Path) col);

    List<FilterRule> rules =
        List.of(
            new FilterRule("bookingDate", "TODAY", null, null),
            new FilterRule("bookingDate", "THIS_WEEK", null, null),
            new FilterRule("bookingDate", "THIS_MONTH", null, null),
            new FilterRule("bookingDate", "LAST_MONTH", null, null),
            new FilterRule("bookingDate", "THIS_YEAR", null, null),
            new FilterRule("bookingDate", "EQ", "2026-11-20", null),
            new FilterRule("bookingDate", "BEFORE", "2026-11-10", null),
            new FilterRule("bookingDate", "AFTER", "2026-11-15", null),
            new FilterRule("bookingDate", "BETWEEN", "2026-11-05", "2026-11-25"),
            new FilterRule("bookingDate", "BETWEEN", "2026-11-02", null),
            new FilterRule("bookingDate", "IS_EMPTY", null, null),
            new FilterRule("bookingDate", "NOT_EMPTY", null, null),
            new FilterRule("bookingDate", "EQ", "bad-date", null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(
            rules, CrmDynamicFilterSpec.CONTRACT_FIELDS, root, cb, REF_WEDNESDAY);

    assertThat(predicates).hasSize(12);
    verify(cb).equal(col, LocalDate.of(2026, 11, 25));
    verify(cb).between(col, LocalDate.of(2026, 11, 23), LocalDate.of(2026, 11, 29));
    verify(cb).between(col, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30));
    verify(cb).between(col, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31));
    verify(cb).between(col, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
    verify(cb).equal(col, LocalDate.of(2026, 11, 20));
    verify(cb).lessThan(col, LocalDate.of(2026, 11, 10));
    verify(cb).greaterThan(col, LocalDate.of(2026, 11, 15));
    verify(cb).between(col, LocalDate.of(2026, 11, 5), LocalDate.of(2026, 11, 25));
    verify(cb).greaterThanOrEqualTo(col, LocalDate.of(2026, 11, 2));
  }

  @Test
  void buildsInstantPredicatesUsingVietnamZoneStartAndExclusiveEndBounds() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmLead> root = mock(Root.class);
    Path<Instant> col = mock(Path.class);
    when(root.get("createdAt")).thenReturn((Path) col);

    LocalDate targetDay = LocalDate.of(2026, 11, 20);
    List<FilterRule> rules =
        List.of(
            new FilterRule("createdAt", "TODAY", null, null),
            new FilterRule("createdAt", "THIS_MONTH", null, null),
            new FilterRule("createdAt", "EQ", "2026-11-20", null),
            new FilterRule("createdAt", "BEFORE", "2026-11-20", null),
            new FilterRule("createdAt", "AFTER", "2026-11-20", null),
            new FilterRule("createdAt", "BETWEEN", "2026-11-01", "2026-11-15"),
            new FilterRule("createdAt", "IS_EMPTY", null, null),
            new FilterRule("createdAt", "NOT_EMPTY", null, null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(
            rules, CrmDynamicFilterSpec.LEAD_FIELDS, root, cb, REF_WEDNESDAY);

    assertThat(predicates).hasSize(8);
    verify(cb).greaterThanOrEqualTo(col, startOfDayInstant(REF_WEDNESDAY));
    verify(cb).lessThan(col, endExclusiveInstant(REF_WEDNESDAY));
    verify(cb).greaterThanOrEqualTo(col, startOfDayInstant(targetDay));
    verify(cb).lessThan(col, endExclusiveInstant(targetDay));
    verify(cb).lessThan(col, startOfDayInstant(targetDay));
    verify(cb).greaterThanOrEqualTo(col, endExclusiveInstant(targetDay));
    verify(cb).lessThan(col, endExclusiveInstant(LocalDate.of(2026, 11, 15)));
  }

  @Test
  void buildsBooleanPredicatesSupportingVietnameseAndNumericValues() {
    CriteriaBuilder cb = mock(CriteriaBuilder.class, Answers.RETURNS_MOCKS);
    Root<CrmAccount> root = mock(Root.class);
    Path<Boolean> sharedCol = mock(Path.class);
    Path<Boolean> partnerCol = mock(Path.class);
    when(root.get("shared")).thenReturn((Path) sharedCol);
    when(root.get("partner")).thenReturn((Path) partnerCol);

    List<FilterRule> rules =
        List.of(
            new FilterRule("shared", "TRUE", null, null),
            new FilterRule("partner", "FALSE", null, null),
            new FilterRule("shared", "EQ", "có", null),
            new FilterRule("partner", "EQ", "không", null),
            new FilterRule("shared", "EQ", "1", null),
            new FilterRule("partner", "EQ", "0", null));

    List<Predicate> predicates =
        CrmDynamicFilterSpec.buildPredicates(rules, CrmDynamicFilterSpec.ACCOUNT_FIELDS, root, cb);

    assertThat(predicates).hasSize(6);
    verify(cb, org.mockito.Mockito.times(3)).isTrue(eq(sharedCol));
    verify(cb, org.mockito.Mockito.times(3)).isFalse(eq(partnerCol));
  }
}

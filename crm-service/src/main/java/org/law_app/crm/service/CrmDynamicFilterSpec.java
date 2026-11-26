package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.VN_ZONE;
import static org.law_app.crm.service.CrmSupport.endExclusiveInstant;
import static org.law_app.crm.service.CrmSupport.hasText;
import static org.law_app.crm.service.CrmSupport.startOfDayInstant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.jpa.domain.Specification;

/**
 * Type-safe, whitelisted dynamic filter engine translating a JSON array of {@link FilterRule}s into
 * JPA Criteria {@link Predicate}s across Lead, Account, Opportunity, and Contract entities.
 */
public final class CrmDynamicFilterSpec {

  public enum FieldKind {
    STRING,
    JSON_LIST,
    DECIMAL,
    LOCAL_DATE,
    INSTANT,
    BOOLEAN
  }

  public record FieldDef(String entityAttr, FieldKind kind) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record FilterRule(String field, String op, String value, String valueTo) {}

  private static final ObjectMapper MAPPER =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  private static final TypeReference<List<FilterRule>> RULE_LIST_TYPE = new TypeReference<>() {};

  public static final Map<String, FieldDef> CONTRACT_FIELDS = buildContractFields();
  public static final Map<String, FieldDef> LEAD_FIELDS = buildLeadFields();
  public static final Map<String, FieldDef> ACCOUNT_FIELDS = buildAccountFields();
  public static final Map<String, FieldDef> OPPORTUNITY_FIELDS = buildOpportunityFields();

  private CrmDynamicFilterSpec() {}

  /**
   * Safely parses the {@code filters} JSON query parameter into a list of {@link FilterRule}s.
   * Blank or malformed JSON returns an empty list rather than throwing an error.
   */
  public static List<FilterRule> parseRules(String filtersJson) {
    if (!hasText(filtersJson)) {
      return List.of();
    }
    String trimmed = filtersJson.trim();
    if (!trimmed.startsWith("[")) {
      return List.of();
    }
    try {
      List<FilterRule> parsed = MAPPER.readValue(trimmed, RULE_LIST_TYPE);
      if (parsed == null || parsed.isEmpty()) {
        return List.of();
      }
      return parsed.stream()
          .filter(r -> r != null && hasText(r.field()) && hasText(r.op()))
          .toList();
    } catch (Exception ignored) {
      return List.of();
    }
  }

  public static <T> Specification<T> toSpecification(
      String filtersJson, Map<String, FieldDef> whitelist) {
    List<FilterRule> rules = parseRules(filtersJson);
    if (rules.isEmpty()) {
      return (root, query, cb) -> cb.conjunction();
    }
    return (root, query, cb) -> {
      List<Predicate> predicates = buildPredicates(rules, whitelist, root, cb);
      return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    };
  }

  public static <T> List<Predicate> toPredicates(
      String filtersJson, Map<String, FieldDef> whitelist, Root<T> root, CriteriaBuilder cb) {
    return buildPredicates(parseRules(filtersJson), whitelist, root, cb);
  }

  public static <T> List<Predicate> buildPredicates(
      List<FilterRule> rules, Map<String, FieldDef> whitelist, Root<T> root, CriteriaBuilder cb) {
    return buildPredicates(rules, whitelist, root, cb, LocalDate.now(VN_ZONE));
  }

  static <T> List<Predicate> buildPredicates(
      List<FilterRule> rules,
      Map<String, FieldDef> whitelist,
      Root<T> root,
      CriteriaBuilder cb,
      LocalDate today) {
    if (rules == null || rules.isEmpty() || whitelist == null || whitelist.isEmpty()) {
      return List.of();
    }
    List<Predicate> predicates = new ArrayList<>();
    for (FilterRule rule : rules) {
      if (rule == null || !hasText(rule.field()) || !hasText(rule.op())) {
        continue;
      }
      FieldDef def = whitelist.get(rule.field().trim());
      if (def == null) {
        continue;
      }
      String op = rule.op().trim().toUpperCase(Locale.ROOT);
      Predicate predicate =
          switch (def.kind()) {
            case STRING -> buildStringPredicate(root.get(def.entityAttr()), op, rule.value(), cb);
            case JSON_LIST ->
                buildJsonListPredicate(root.get(def.entityAttr()), op, rule.value(), cb);
            case DECIMAL ->
                buildDecimalPredicate(
                    root.get(def.entityAttr()), op, rule.value(), rule.valueTo(), cb);
            case LOCAL_DATE ->
                buildLocalDatePredicate(
                    root.get(def.entityAttr()), op, rule.value(), rule.valueTo(), cb, today);
            case INSTANT ->
                buildInstantPredicate(
                    root.get(def.entityAttr()), op, rule.value(), rule.valueTo(), cb, today);
            case BOOLEAN -> buildBooleanPredicate(root.get(def.entityAttr()), op, rule.value(), cb);
          };
      if (predicate != null) {
        predicates.add(predicate);
      }
    }
    return predicates;
  }

  private static Predicate buildStringPredicate(
      Path<String> col, String op, String rawValue, CriteriaBuilder cb) {
    return switch (op) {
      case "IS_EMPTY" -> cb.or(cb.isNull(col), cb.equal(cb.trim(col), ""), cb.equal(col, "[]"));
      case "NOT_EMPTY" ->
          cb.and(cb.isNotNull(col), cb.notEqual(cb.trim(col), ""), cb.notEqual(col, "[]"));
      case "CONTAINS" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.like(cb.lower(col), "%" + v + "%");
      }
      case "NOT_CONTAINS" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(cb.isNull(col), cb.notLike(cb.lower(col), "%" + v + "%"));
      }
      case "EQ" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.equal(cb.lower(col), v);
      }
      case "NEQ" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(cb.isNull(col), cb.notEqual(cb.lower(col), v));
      }
      case "STARTS_WITH" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.like(cb.lower(col), v + "%");
      }
      default -> null;
    };
  }

  private static Predicate buildJsonListPredicate(
      Path<String> col, String op, String rawValue, CriteriaBuilder cb) {
    return switch (op) {
      case "IS_EMPTY" -> cb.or(cb.isNull(col), cb.equal(cb.trim(col), ""), cb.equal(col, "[]"));
      case "NOT_EMPTY" ->
          cb.and(cb.isNotNull(col), cb.notEqual(cb.trim(col), ""), cb.notEqual(col, "[]"));
      case "CONTAINS" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.like(cb.lower(col), "%" + v + "%");
      }
      case "NOT_CONTAINS" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(cb.isNull(col), cb.notLike(cb.lower(col), "%" + v + "%"));
      }
      case "EQ" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(cb.like(cb.lower(col), "%\"" + v + "\"%"), cb.equal(cb.lower(col), v));
      }
      case "NEQ" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(
            cb.isNull(col),
            cb.and(cb.notLike(cb.lower(col), "%\"" + v + "\"%"), cb.notEqual(cb.lower(col), v)));
      }
      case "STARTS_WITH" -> {
        if (!hasText(rawValue)) yield null;
        String v = rawValue.trim().toLowerCase(Locale.ROOT);
        yield cb.or(cb.like(cb.lower(col), "%\"" + v + "%"), cb.like(cb.lower(col), v + "%"));
      }
      default -> null;
    };
  }

  private static Predicate buildDecimalPredicate(
      Path<BigDecimal> col, String op, String rawValue, String rawValueTo, CriteriaBuilder cb) {
    return switch (op) {
      case "IS_EMPTY" -> cb.isNull(col);
      case "NOT_EMPTY" -> cb.isNotNull(col);
      case "ZERO" -> cb.or(cb.isNull(col), cb.equal(col, BigDecimal.ZERO));
      case "GT_ZERO" -> cb.greaterThan(col, BigDecimal.ZERO);
      case "EQ" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.equal(col, num) : null;
      }
      case "NEQ" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.or(cb.isNull(col), cb.notEqual(col, num)) : null;
      }
      case "GT" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.greaterThan(col, num) : null;
      }
      case "GTE" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.greaterThanOrEqualTo(col, num) : null;
      }
      case "LT" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.lessThan(col, num) : null;
      }
      case "LTE" -> {
        BigDecimal num = parseDecimal(rawValue);
        yield num != null ? cb.lessThanOrEqualTo(col, num) : null;
      }
      case "BETWEEN" -> {
        BigDecimal from = parseDecimal(rawValue);
        BigDecimal to = parseDecimal(rawValueTo);
        if (from != null && to != null) {
          yield cb.between(col, from, to);
        } else if (from != null) {
          yield cb.greaterThanOrEqualTo(col, from);
        } else if (to != null) {
          yield cb.lessThanOrEqualTo(col, to);
        } else {
          yield null;
        }
      }
      default -> null;
    };
  }

  private static Predicate buildLocalDatePredicate(
      Path<LocalDate> col,
      String op,
      String rawValue,
      String rawValueTo,
      CriteriaBuilder cb,
      LocalDate today) {
    return switch (op) {
      case "IS_EMPTY" -> cb.isNull(col);
      case "NOT_EMPTY" -> cb.isNotNull(col);
      case "TODAY" -> cb.equal(col, today);
      case "THIS_WEEK" -> {
        LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(6);
        yield cb.between(col, start, end);
      }
      case "THIS_MONTH" -> {
        LocalDate start = today.withDayOfMonth(1);
        LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth());
        yield cb.between(col, start, end);
      }
      case "LAST_MONTH" -> {
        LocalDate prev = today.minusMonths(1);
        LocalDate start = prev.withDayOfMonth(1);
        LocalDate end = prev.with(TemporalAdjusters.lastDayOfMonth());
        yield cb.between(col, start, end);
      }
      case "THIS_YEAR" -> {
        LocalDate start = LocalDate.of(today.getYear(), 1, 1);
        LocalDate end = LocalDate.of(today.getYear(), 12, 31);
        yield cb.between(col, start, end);
      }
      case "EQ" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? cb.equal(col, d) : null;
      }
      case "BEFORE" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? cb.lessThan(col, d) : null;
      }
      case "AFTER" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? cb.greaterThan(col, d) : null;
      }
      case "BETWEEN" -> {
        LocalDate from = parseLocalDate(rawValue);
        LocalDate to = parseLocalDate(rawValueTo);
        if (from != null && to != null) {
          yield cb.between(col, from, to);
        } else if (from != null) {
          yield cb.greaterThanOrEqualTo(col, from);
        } else if (to != null) {
          yield cb.lessThanOrEqualTo(col, to);
        } else {
          yield null;
        }
      }
      default -> null;
    };
  }

  private static Predicate buildInstantPredicate(
      Path<Instant> col,
      String op,
      String rawValue,
      String rawValueTo,
      CriteriaBuilder cb,
      LocalDate today) {
    return switch (op) {
      case "IS_EMPTY" -> cb.isNull(col);
      case "NOT_EMPTY" -> cb.isNotNull(col);
      case "TODAY" -> instantDayRange(col, today, today, cb);
      case "THIS_WEEK" -> {
        LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(6);
        yield instantDayRange(col, start, end, cb);
      }
      case "THIS_MONTH" -> {
        LocalDate start = today.withDayOfMonth(1);
        LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth());
        yield instantDayRange(col, start, end, cb);
      }
      case "LAST_MONTH" -> {
        LocalDate prev = today.minusMonths(1);
        LocalDate start = prev.withDayOfMonth(1);
        LocalDate end = prev.with(TemporalAdjusters.lastDayOfMonth());
        yield instantDayRange(col, start, end, cb);
      }
      case "THIS_YEAR" -> {
        LocalDate start = LocalDate.of(today.getYear(), 1, 1);
        LocalDate end = LocalDate.of(today.getYear(), 12, 31);
        yield instantDayRange(col, start, end, cb);
      }
      case "EQ" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? instantDayRange(col, d, d, cb) : null;
      }
      case "BEFORE" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? cb.lessThan(col, startOfDayInstant(d)) : null;
      }
      case "AFTER" -> {
        LocalDate d = parseLocalDate(rawValue);
        yield d != null ? cb.greaterThanOrEqualTo(col, endExclusiveInstant(d)) : null;
      }
      case "BETWEEN" -> {
        LocalDate from = parseLocalDate(rawValue);
        LocalDate to = parseLocalDate(rawValueTo);
        if (from != null && to != null) {
          yield instantDayRange(col, from, to, cb);
        } else if (from != null) {
          yield cb.greaterThanOrEqualTo(col, startOfDayInstant(from));
        } else if (to != null) {
          yield cb.lessThan(col, endExclusiveInstant(to));
        } else {
          yield null;
        }
      }
      default -> null;
    };
  }

  private static Predicate instantDayRange(
      Path<Instant> col, LocalDate startDay, LocalDate endDay, CriteriaBuilder cb) {
    return cb.and(
        cb.greaterThanOrEqualTo(col, startOfDayInstant(startDay)),
        cb.lessThan(col, endExclusiveInstant(endDay)));
  }

  private static Predicate buildBooleanPredicate(
      Path<Boolean> col, String op, String rawValue, CriteriaBuilder cb) {
    return switch (op) {
      case "TRUE" -> cb.isTrue(col);
      case "FALSE" -> cb.isFalse(col);
      case "EQ" -> {
        Boolean b = parseBoolean(rawValue);
        if (b == null) yield null;
        yield b ? cb.isTrue(col) : cb.isFalse(col);
      }
      case "NEQ" -> {
        Boolean b = parseBoolean(rawValue);
        if (b == null) yield null;
        yield b ? cb.isFalse(col) : cb.isTrue(col);
      }
      default -> null;
    };
  }

  static BigDecimal parseDecimal(String raw) {
    if (!hasText(raw)) {
      return null;
    }
    String cleaned = raw.trim().replaceAll("[\\s_₫đĐ$a-zA-Z]", "");
    if (cleaned.isEmpty()) {
      return null;
    }
    int firstDot = cleaned.indexOf('.');
    int lastDot = cleaned.lastIndexOf('.');
    int firstComma = cleaned.indexOf(',');
    int lastComma = cleaned.lastIndexOf(',');

    if (firstDot >= 0 && firstComma >= 0) {
      if (lastDot > lastComma) {
        cleaned = cleaned.replace(",", "");
      } else {
        cleaned = cleaned.replace(".", "").replace(',', '.');
      }
    } else if (firstDot >= 0 && firstDot != lastDot) {
      cleaned = cleaned.replace(".", "");
    } else if (firstComma >= 0 && firstComma != lastComma) {
      cleaned = cleaned.replace(",", "");
    } else if (firstComma >= 0) {
      if (cleaned.matches("-?\\d{1,3},\\d{3}")) {
        cleaned = cleaned.replace(",", "");
      } else {
        cleaned = cleaned.replace(',', '.');
      }
    } else if (firstDot >= 0 && cleaned.matches("-?[1-9]\\d{0,2}\\.\\d{3}")) {
      cleaned = cleaned.replace(".", "");
    }

    try {
      return new BigDecimal(cleaned);
    } catch (NumberFormatException ex) {
      return null;
    }
  }

  static LocalDate parseLocalDate(String raw) {
    if (!hasText(raw)) {
      return null;
    }
    String trimmed = raw.trim();
    try {
      return LocalDate.parse(trimmed);
    } catch (DateTimeParseException ex) {
      if (trimmed.length() > 10) {
        try {
          return LocalDate.parse(trimmed.substring(0, 10));
        } catch (DateTimeParseException ignored) {
          return null;
        }
      }
      return null;
    }
  }

  private static Boolean parseBoolean(String raw) {
    if (!hasText(raw)) {
      return null;
    }
    return switch (raw.trim().toLowerCase(Locale.ROOT)) {
      case "true", "1", "có", "co", "yes" -> Boolean.TRUE;
      case "false", "0", "không", "khong", "no" -> Boolean.FALSE;
      default -> null;
    };
  }

  private static void put(Map<String, FieldDef> map, String field, FieldKind kind) {
    map.put(field, new FieldDef(field, kind));
  }

  private static Map<String, FieldDef> buildContractFields() {
    Map<String, FieldDef> m = new LinkedHashMap<>();
    put(m, "bookingDate", FieldKind.LOCAL_DATE);
    put(m, "paymentDate", FieldKind.LOCAL_DATE);
    put(m, "goodsSummary", FieldKind.STRING);
    put(m, "revenueStatus", FieldKind.STRING);
    put(m, "executionStatus", FieldKind.STRING);
    put(m, "assignedUserId", FieldKind.STRING);
    put(m, "assignedUserName", FieldKind.STRING);
    put(m, "contractNumber", FieldKind.STRING);
    put(m, "accountName", FieldKind.STRING);
    put(m, "accountCode", FieldKind.STRING);
    put(m, "orderValue", FieldKind.DECIMAL);
    put(m, "collectedAmount", FieldKind.DECIMAL);
    put(m, "actualExpense", FieldKind.DECIMAL);
    put(m, "plannedExpense", FieldKind.DECIMAL);
    put(m, "receivableAmount", FieldKind.DECIMAL);
    put(m, "payableAmount", FieldKind.DECIMAL);
    put(m, "estimatedProfit", FieldKind.DECIMAL);
    put(m, "department", FieldKind.STRING);
    put(m, "contactName", FieldKind.STRING);
    put(m, "liquidationValue", FieldKind.DECIMAL);
    put(m, "leadSource", FieldKind.STRING);
    put(m, "contractSource", FieldKind.STRING);
    put(m, "submissionDate", FieldKind.LOCAL_DATE);
    put(m, "handoverDeadline", FieldKind.LOCAL_DATE);
    put(m, "archivedStatus", FieldKind.STRING);
    put(m, "paymentTermType", FieldKind.STRING);
    put(m, "parentContractNumber", FieldKind.STRING);
    put(m, "serviceExpense", FieldKind.DECIMAL);
    put(m, "stateFeeExpense", FieldKind.DECIMAL);
    put(m, "supportExpense", FieldKind.DECIMAL);
    put(m, "productionDeadline", FieldKind.LOCAL_DATE);
    put(m, "uninvoicedAmount", FieldKind.DECIMAL);
    put(m, "taxCode", FieldKind.STRING);
    put(m, "invoiceCustomerName", FieldKind.STRING);
    put(m, "buyerName", FieldKind.STRING);
    put(m, "invoiceCountry", FieldKind.STRING);
    put(m, "invoiceProvince", FieldKind.STRING);
    put(m, "invoiceDistrict", FieldKind.STRING);
    put(m, "invoiceAddress", FieldKind.STRING);
    put(m, "invoiceLookupCode", FieldKind.STRING);
    put(m, "externalOrderNumber", FieldKind.STRING);
    put(m, "unitName", FieldKind.STRING);
    put(m, "orderDate", FieldKind.LOCAL_DATE);
    put(m, "referrer", FieldKind.STRING);
    put(m, "shared", FieldKind.BOOLEAN);
    put(m, "syncPriceAfterDiscount", FieldKind.BOOLEAN);
    put(m, "notes", FieldKind.STRING);
    put(m, "tags", FieldKind.JSON_LIST);
    put(m, "createdAt", FieldKind.INSTANT);
    put(m, "updatedAt", FieldKind.INSTANT);
    put(m, "deletedAt", FieldKind.INSTANT);
    put(m, "deletedBy", FieldKind.STRING);
    return Collections.unmodifiableMap(m);
  }

  private static Map<String, FieldDef> buildLeadFields() {
    Map<String, FieldDef> m = new LinkedHashMap<>();
    put(m, "tags", FieldKind.JSON_LIST);
    put(m, "createdAt", FieldKind.INSTANT);
    put(m, "customerStatus", FieldKind.STRING);
    put(m, "assignedUserId", FieldKind.STRING);
    put(m, "assignedUserName", FieldKind.STRING);
    put(m, "fullName", FieldKind.STRING);
    put(m, "customerName", FieldKind.STRING);
    put(m, "phone", FieldKind.STRING);
    put(m, "serviceGroups", FieldKind.JSON_LIST);
    put(m, "demandDetail", FieldKind.STRING);
    put(m, "organizationName", FieldKind.STRING);
    put(m, "province", FieldKind.STRING);
    put(m, "leadSource", FieldKind.STRING);
    put(m, "ownerUserId", FieldKind.STRING);
    put(m, "ownerUserName", FieldKind.STRING);
    put(m, "code", FieldKind.STRING);
    put(m, "taxCode", FieldKind.STRING);
    put(m, "personalEmail", FieldKind.STRING);
    put(m, "workEmail", FieldKind.STRING);
    put(m, "jobTitle", FieldKind.STRING);
    put(m, "gender", FieldKind.STRING);
    put(m, "zalo", FieldKind.STRING);
    put(m, "website", FieldKind.STRING);
    put(m, "birthDate", FieldKind.LOCAL_DATE);
    put(m, "companySize", FieldKind.STRING);
    put(m, "country", FieldKind.STRING);
    put(m, "district", FieldKind.STRING);
    put(m, "address", FieldKind.STRING);
    put(m, "department", FieldKind.STRING);
    put(m, "shared", FieldKind.BOOLEAN);
    put(m, "lastInteractedAt", FieldKind.INSTANT);
    put(m, "convertedAt", FieldKind.INSTANT);
    put(m, "updatedAt", FieldKind.INSTANT);
    put(m, "deletedAt", FieldKind.INSTANT);
    put(m, "deletedBy", FieldKind.STRING);
    return Collections.unmodifiableMap(m);
  }

  private static Map<String, FieldDef> buildAccountFields() {
    Map<String, FieldDef> m = new LinkedHashMap<>();
    put(m, "createdAt", FieldKind.INSTANT);
    put(m, "customerStatus", FieldKind.STRING);
    put(m, "serviceGroups", FieldKind.JSON_LIST);
    put(m, "demandDetail", FieldKind.STRING);
    put(m, "assignedUserId", FieldKind.STRING);
    put(m, "assignedUserName", FieldKind.STRING);
    put(m, "customerName", FieldKind.STRING);
    put(m, "relatedUsers", FieldKind.STRING);
    put(m, "phone", FieldKind.STRING);
    put(m, "servicesSummary", FieldKind.STRING);
    put(m, "careStatuses", FieldKind.JSON_LIST);
    put(m, "ownerUserId", FieldKind.STRING);
    put(m, "ownerUserName", FieldKind.STRING);
    put(m, "billingProvince", FieldKind.STRING);
    put(m, "code", FieldKind.STRING);
    put(m, "tags", FieldKind.JSON_LIST);
    put(m, "taxCode", FieldKind.STRING);
    put(m, "email", FieldKind.STRING);
    put(m, "industries", FieldKind.JSON_LIST);
    put(m, "leadSource", FieldKind.STRING);
    put(m, "lostReason", FieldKind.STRING);
    put(m, "rankLabel", FieldKind.STRING);
    put(m, "contactName", FieldKind.STRING);
    put(m, "contactTitle", FieldKind.STRING);
    put(m, "contactPhone", FieldKind.STRING);
    put(m, "contactEmail", FieldKind.STRING);
    put(m, "contactBirthDate", FieldKind.LOCAL_DATE);
    put(m, "billingDistrict", FieldKind.STRING);
    put(m, "billingAddress", FieldKind.STRING);
    put(m, "companySize", FieldKind.STRING);
    put(m, "foundedDate", FieldKind.LOCAL_DATE);
    put(m, "paymentTermType", FieldKind.STRING);
    put(m, "website", FieldKind.STRING);
    put(m, "annualRevenue", FieldKind.DECIMAL);
    put(m, "shared", FieldKind.BOOLEAN);
    put(m, "individual", FieldKind.BOOLEAN);
    put(m, "partner", FieldKind.BOOLEAN);
    put(m, "referrer", FieldKind.STRING);
    put(m, "updatedAt", FieldKind.INSTANT);
    put(m, "deletedAt", FieldKind.INSTANT);
    put(m, "deletedBy", FieldKind.STRING);
    return Collections.unmodifiableMap(m);
  }

  private static Map<String, FieldDef> buildOpportunityFields() {
    Map<String, FieldDef> m = new LinkedHashMap<>();
    put(m, "tags", FieldKind.JSON_LIST);
    put(m, "opportunityName", FieldKind.STRING);
    put(m, "contactName", FieldKind.STRING);
    put(m, "contactPhone", FieldKind.STRING);
    put(m, "expectedRevenue", FieldKind.DECIMAL);
    put(m, "stage", FieldKind.STRING);
    put(m, "expectedCloseDate", FieldKind.LOCAL_DATE);
    put(m, "serviceGroups", FieldKind.JSON_LIST);
    put(m, "assignedUserId", FieldKind.STRING);
    put(m, "assignedUserName", FieldKind.STRING);
    put(m, "createdAt", FieldKind.INSTANT);
    put(m, "code", FieldKind.STRING);
    put(m, "accountId", FieldKind.STRING);
    put(m, "accountName", FieldKind.STRING);
    put(m, "opportunityTypes", FieldKind.JSON_LIST);
    put(m, "leadSource", FieldKind.STRING);
    put(m, "shared", FieldKind.BOOLEAN);
    put(m, "referrer", FieldKind.STRING);
    put(m, "notes", FieldKind.STRING);
    put(m, "updatedAt", FieldKind.INSTANT);
    put(m, "deletedAt", FieldKind.INSTANT);
    put(m, "deletedBy", FieldKind.STRING);
    return Collections.unmodifiableMap(m);
  }
}

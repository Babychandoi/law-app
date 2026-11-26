package org.law_app.crm.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.law_app.crm.web.CurrentUser;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/** Shared normalization, JSON list serialization, line-item math, and query helpers. */
public final class CrmSupport {

  public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {};

  private CrmSupport() {}

  public static String newId() {
    return UUID.randomUUID().toString();
  }

  public static boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  public static String blankToDefault(String value, String fallback) {
    return hasText(value) ? value.trim() : fallback;
  }

  public static String trimOrNull(String value) {
    return hasText(value) ? value.trim() : null;
  }

  /** Normalizes currency/quantity BigDecimals without producing scientific notation. */
  public static BigDecimal money(BigDecimal value) {
    if (value == null) {
      return BigDecimal.ZERO;
    }
    BigDecimal rounded = value.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
    return rounded.scale() < 0 ? rounded.setScale(0, RoundingMode.UNNECESSARY) : rounded;
  }

  /** Parses VAT rate strings such as "0%", "5%", "8%", "10%", "KCT" into numeric percent. */
  public static BigDecimal parseVatPercent(String vatRate) {
    if (!hasText(vatRate)) {
      return BigDecimal.ZERO;
    }
    String normalized = vatRate.trim().toUpperCase();
    if ("KCT".equals(normalized) || "KKKNT".equals(normalized)) {
      return BigDecimal.ZERO;
    }
    String numeric = normalized.replace("%", "").trim();
    try {
      BigDecimal parsed = new BigDecimal(numeric);
      return parsed.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : parsed;
    } catch (NumberFormatException ex) {
      return BigDecimal.ZERO;
    }
  }

  public static String normalizeVatRate(String vatRate) {
    if (!hasText(vatRate)) {
      return "0%";
    }
    String trimmed = vatRate.trim().toUpperCase();
    if ("KCT".equals(trimmed) || "KKKNT".equals(trimmed)) {
      return trimmed;
    }
    if (trimmed.endsWith("%")) {
      return trimmed;
    }
    return trimmed + "%";
  }

  /** Computes canonical server-side line item totals. */
  public static CrmLineItemDto computeLineItem(CrmLineItemDto raw, int index) {
    BigDecimal quantity = raw.quantity() != null ? money(raw.quantity()) : BigDecimal.ONE;
    BigDecimal deliveredQty =
        raw.deliveredQuantity() != null ? money(raw.deliveredQuantity()) : BigDecimal.ZERO;
    BigDecimal unitPrice = raw.unitPrice() != null ? money(raw.unitPrice()) : BigDecimal.ZERO;
    BigDecimal amount = money(quantity.multiply(unitPrice));

    BigDecimal discountRate =
        raw.discountRate() != null ? money(raw.discountRate()) : BigDecimal.ZERO;
    BigDecimal tradeDiscount =
        raw.tradeDiscount() != null ? money(raw.tradeDiscount()) : BigDecimal.ZERO;

    BigDecimal discountAmount;
    if (discountRate.compareTo(BigDecimal.ZERO) > 0) {
      discountAmount =
          money(
              amount
                  .multiply(discountRate)
                  .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
    } else if (tradeDiscount.compareTo(BigDecimal.ZERO) > 0) {
      discountAmount = tradeDiscount;
    } else if (raw.discountAmount() != null
        && raw.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
      discountAmount = money(raw.discountAmount());
    } else {
      discountAmount = BigDecimal.ZERO;
    }

    BigDecimal taxable = money(amount.subtract(discountAmount).max(BigDecimal.ZERO));
    String vatRate = normalizeVatRate(raw.vatRate());
    BigDecimal vatPercent = parseVatPercent(vatRate);
    BigDecimal vatAmount =
        money(
            taxable.multiply(vatPercent).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
    BigDecimal totalAmount = money(taxable.add(vatAmount));

    return new CrmLineItemDto(
        hasText(raw.id()) ? raw.id().trim() : newId(),
        raw.sortOrder() > 0 ? raw.sortOrder() : (index + 1),
        trimOrNull(raw.itemCode()),
        trimOrNull(raw.description()),
        trimOrNull(raw.warehouse()),
        blankToDefault(raw.unit(), "Hồ sơ"),
        quantity,
        deliveredQty,
        unitPrice,
        amount,
        tradeDiscount,
        discountRate,
        discountAmount,
        vatRate,
        vatAmount,
        totalAmount,
        trimOrNull(raw.parentContractNumber()),
        trimOrNull(raw.promotionCode()),
        raw.freeItem());
  }

  public static String toJsonList(List<String> values) {
    if (values == null || values.isEmpty()) {
      return null;
    }
    List<String> cleaned =
        values.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .toList();
    if (cleaned.isEmpty()) {
      return null;
    }
    try {
      return MAPPER.writeValueAsString(cleaned);
    } catch (JsonProcessingException e) {
      return String.join(",", cleaned);
    }
  }

  public static List<String> fromJsonList(String raw) {
    if (!hasText(raw)) {
      return List.of();
    }
    String trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        List<String> parsed = MAPPER.readValue(trimmed, STRING_LIST_TYPE);
        return parsed == null
            ? List.of()
            : parsed.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
      } catch (JsonProcessingException ignored) {
        // fallback below
      }
    }
    return Arrays.stream(trimmed.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
  }

  public static String addTagToJsonList(String rawJson, String tag) {
    if (!hasText(tag)) {
      return rawJson;
    }
    String cleanTag = tag.trim();
    List<String> current = new java.util.ArrayList<>(fromJsonList(rawJson));
    if (current.stream().noneMatch(t -> t.equalsIgnoreCase(cleanTag))) {
      current.add(cleanTag);
    }
    return toJsonList(current);
  }

  public static String removeTagFromJsonList(String rawJson, String tag) {
    if (!hasText(tag)) {
      return rawJson;
    }
    String cleanTag = tag.trim();
    List<String> current = new java.util.ArrayList<>(fromJsonList(rawJson));
    current.removeIf(t -> t.equalsIgnoreCase(cleanTag));
    return toJsonList(current);
  }

  public static int parseTrailingNumber(String code, String prefix) {
    if (!hasText(code) || !code.startsWith(prefix)) {
      return 0;
    }
    String suffix = code.substring(prefix.length()).trim();
    try {
      return Integer.parseInt(suffix);
    } catch (NumberFormatException ex) {
      return 0;
    }
  }

  public static Instant startOfDayInstant(LocalDate date) {
    return date.atStartOfDay(VN_ZONE).toInstant();
  }

  public static Instant endExclusiveInstant(LocalDate date) {
    return date.plusDays(1).atStartOfDay(VN_ZONE).toInstant();
  }

  public static Predicate assignedPredicate(
      CriteriaBuilder cb, Root<?> root, String assignedTo, String me) {
    if (!hasText(assignedTo) || "all".equalsIgnoreCase(assignedTo.trim())) {
      return null;
    }
    return switch (assignedTo.trim()) {
      case "me" -> cb.equal(root.get("assignedUserId"), me != null ? me : "");
      case "none" ->
          cb.or(cb.isNull(root.get("assignedUserId")), cb.equal(root.get("assignedUserId"), ""));
      case "any" ->
          cb.and(
              cb.isNotNull(root.get("assignedUserId")),
              cb.notEqual(root.get("assignedUserId"), ""));
      default -> cb.equal(root.get("assignedUserId"), assignedTo.trim());
    };
  }

  public static Sort resolveSort(
      String sortParam, Map<String, String> allowedFields, String defaultField) {
    Sort fallback = Sort.by(Sort.Direction.DESC, defaultField);
    if (!hasText(sortParam)) {
      return fallback;
    }
    String[] parts = sortParam.split(",");
    String mappedField = allowedFields.get(parts[0].trim());
    if (mappedField == null) {
      return fallback;
    }
    Sort.Direction dir =
        parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
    return Sort.by(dir, mappedField);
  }

  public static String currentActorId() {
    String id = CurrentUser.id();
    return hasText(id) ? id : "system";
  }

  public static String currentActorName() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) {
      return "Hệ thống";
    }
    Object principal = auth.getPrincipal();
    if (principal instanceof Jwt jwt) {
      for (String claim : List.of("fullName", "name", "preferred_username", "username")) {
        String val = jwt.getClaimAsString(claim);
        if (hasText(val)) {
          return val.trim();
        }
      }
      if (hasText(jwt.getSubject())) {
        return jwt.getSubject();
      }
    }
    return hasText(auth.getName()) ? auth.getName() : "Hệ thống";
  }
}

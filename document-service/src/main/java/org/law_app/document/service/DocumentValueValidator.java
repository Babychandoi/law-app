package org.law_app.document.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplateField;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Server-side schema and value validation; frontend input types are never treated as a trust
 * boundary.
 */
@Service
public class DocumentValueValidator {
  private static final int DEFAULT_MAX_LENGTH = 100_000;
  private static final int MAX_TOTAL_VALUE_CHARACTERS = 1_000_000;
  private static final Pattern EMAIL =
      Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,63}$", Pattern.CASE_INSENSITIVE);
  private static final Pattern PHONE = Pattern.compile("^\\+?[0-9 ()\\-.]{7,25}$");
  private static final Pattern IDENTIFIER = Pattern.compile("^[\\p{L}\\p{N}./\\- ]{5,40}$");

  public void validateSchema(List<DocumentTemplateField> fields) {
    if (fields == null || fields.isEmpty()) throw badRequest("Mẫu phải có ít nhất một field");
    if (fields.size() > 500) throw badRequest("Mẫu không được vượt quá 500 field");
    Set<String> keys = new LinkedHashSet<>();
    Set<Integer> sortOrders = new LinkedHashSet<>();
    for (DocumentTemplateField field : fields) {
      if (field.getFieldKey() == null
          || !field.getFieldKey().matches("[A-Za-z][A-Za-z0-9_]{0,63}")) {
        throw badRequest("Key không hợp lệ: " + field.getFieldKey());
      }
      if (!keys.add(field.getFieldKey())) throw badRequest("Key bị trùng: " + field.getFieldKey());
      if (field.getLabel() == null || field.getLabel().isBlank()) {
        throw badRequest("Tất cả key phải có label trước khi publish");
      }
      if (field.getLabel().length() > 200) {
        throw badRequest("Label vượt quá 200 ký tự: " + field.getFieldKey());
      }
      if (!sortOrders.add(field.getSortOrder())) {
        throw badRequest("Thứ tự field bị trùng: " + field.getSortOrder());
      }
      if (field.getMaxLength() != null
          && (field.getMaxLength() < 1 || field.getMaxLength() > DEFAULT_MAX_LENGTH)) {
        throw badRequest("maxLength không hợp lệ: " + field.getFieldKey());
      }
      if (field.getMinimum() != null
          && field.getMaximum() != null
          && field.getMinimum().compareTo(field.getMaximum()) > 0) {
        throw badRequest("minimum lớn hơn maximum: " + field.getFieldKey());
      }
      validatePattern(field);
      validateOptions(field);
      if (field.getDefaultValue() != null && !field.getDefaultValue().isBlank()) {
        validateValue(field, field.getDefaultValue());
      }
    }
  }

  public Map<String, String> normalizeAndValidate(
      List<DocumentTemplateField> fields, Map<String, String> input) {
    validateSchemaForGeneration(fields);
    Map<String, String> source = input == null ? Map.of() : input;
    long inputCharacters =
        source.entrySet().stream()
            .mapToLong(
                entry ->
                    (entry.getKey() == null ? 0 : entry.getKey().length())
                        + (entry.getValue() == null ? 0 : entry.getValue().length()))
            .sum();
    if (inputCharacters > MAX_TOTAL_VALUE_CHARACTERS) {
      throw badRequest("Tổng dữ liệu nhập vượt quá giới hạn 1.000.000 ký tự");
    }
    Set<String> knownKeys = new LinkedHashSet<>();
    fields.forEach(field -> knownKeys.add(field.getFieldKey()));
    for (String key : source.keySet()) {
      if (!knownKeys.contains(key)) {
        throw badRequest("Yêu cầu chứa key không tồn tại trong mẫu");
      }
    }

    Map<String, String> normalized = new LinkedHashMap<>();
    fields.stream()
        .sorted(java.util.Comparator.comparingInt(DocumentTemplateField::getSortOrder))
        .forEach(
            field -> {
              String value = source.get(field.getFieldKey());
              if ((value == null || value.isBlank()) && field.getDefaultValue() != null) {
                value = field.getDefaultValue();
              }
              if (field.isRequired() && (value == null || value.isBlank())) {
                throw badRequest("Thiếu giá trị cho: " + field.getLabel());
              }
              normalized.put(
                  field.getFieldKey(),
                  value == null || value.isBlank() ? "" : validateValue(field, value));
            });
    long normalizedCharacters = normalized.values().stream().mapToLong(String::length).sum();
    if (normalizedCharacters > MAX_TOTAL_VALUE_CHARACTERS) {
      throw badRequest("Tổng dữ liệu sau khi áp dụng mặc định vượt quá giới hạn");
    }
    return normalized;
  }

  private void validateSchemaForGeneration(List<DocumentTemplateField> fields) {
    if (fields == null || fields.isEmpty()) throw badRequest("Mẫu chưa có schema field");
    Set<String> keys = new LinkedHashSet<>();
    for (DocumentTemplateField field : fields) {
      if (field.getFieldKey() == null || !keys.add(field.getFieldKey())) {
        throw badRequest("Schema field của mẫu không hợp lệ");
      }
    }
  }

  private String validateValue(DocumentTemplateField field, String rawValue) {
    int maxLength = field.getMaxLength() == null ? DEFAULT_MAX_LENGTH : field.getMaxLength();
    if (rawValue.length() > maxLength) {
      throw badRequest("Giá trị vượt quá độ dài cho phép: " + field.getLabel());
    }
    String trimmed = rawValue.trim();
    String normalized = rawValue;
    DocumentFieldInputType type =
        field.getInputType() == null ? DocumentFieldInputType.TEXT : field.getInputType();
    try {
      switch (type) {
        case DATE -> normalized = LocalDate.parse(trimmed).toString();
        case NUMBER, CURRENCY -> normalized = validateNumber(field, trimmed, false);
        case PERCENT -> normalized = validateNumber(field, trimmed, true);
        case EMAIL -> {
          if (trimmed.length() > 254 || !EMAIL.matcher(trimmed).matches()) {
            throw badRequest("Email không hợp lệ: " + field.getLabel());
          }
          normalized = trimmed;
        }
        case PHONE -> {
          long digits = trimmed.chars().filter(Character::isDigit).count();
          if (!PHONE.matcher(trimmed).matches() || digits < 7 || digits > 15) {
            throw badRequest("Số điện thoại không hợp lệ: " + field.getLabel());
          }
          normalized = trimmed;
        }
        case TAX_ID, NATIONAL_ID -> {
          if (!IDENTIFIER.matcher(trimmed).matches()) {
            throw badRequest("Mã định danh không hợp lệ: " + field.getLabel());
          }
          normalized = trimmed;
        }
        case SELECT -> {
          if (field.getOptions() == null || !field.getOptions().contains(rawValue)) {
            throw badRequest("Lựa chọn không hợp lệ: " + field.getLabel());
          }
        }
        case MULTISELECT -> normalized = validateMultiSelect(field, rawValue);
        case TEXT, TEXTAREA -> {
          // Preserve intentional whitespace in legal clauses.
        }
      }
    } catch (DateTimeParseException e) {
      throw badRequest("Ngày phải theo định dạng ISO yyyy-MM-dd: " + field.getLabel());
    } catch (NumberFormatException e) {
      throw badRequest("Số không hợp lệ: " + field.getLabel());
    }
    if (field.getValidationPattern() != null
        && !field.getValidationPattern().isBlank()
        && !Pattern.compile(field.getValidationPattern()).matcher(normalized).matches()) {
      throw badRequest("Giá trị không đúng định dạng: " + field.getLabel());
    }
    return normalized;
  }

  private String validateNumber(DocumentTemplateField field, String value, boolean percent) {
    BigDecimal number = new BigDecimal(value);
    BigDecimal minimum =
        field.getMinimum() != null ? field.getMinimum() : (percent ? BigDecimal.ZERO : null);
    BigDecimal maximum =
        field.getMaximum() != null
            ? field.getMaximum()
            : (percent ? BigDecimal.valueOf(100) : null);
    if (minimum != null && number.compareTo(minimum) < 0) {
      throw badRequest("Giá trị nhỏ hơn minimum: " + field.getLabel());
    }
    if (maximum != null && number.compareTo(maximum) > 0) {
      throw badRequest("Giá trị lớn hơn maximum: " + field.getLabel());
    }
    return number.stripTrailingZeros().toPlainString();
  }

  private String validateMultiSelect(DocumentTemplateField field, String rawValue) {
    List<String> selected = new ArrayList<>();
    for (String item : rawValue.split(",")) {
      String value = item.trim();
      if (!value.isEmpty()) selected.add(value);
    }
    if (selected.isEmpty() && field.isRequired()) {
      throw badRequest("Phải chọn ít nhất một giá trị: " + field.getLabel());
    }
    if (field.getOptions() == null || !field.getOptions().containsAll(selected)) {
      throw badRequest("Danh sách lựa chọn không hợp lệ: " + field.getLabel());
    }
    return String.join(", ", selected);
  }

  private void validatePattern(DocumentTemplateField field) {
    String pattern = field.getValidationPattern();
    if (pattern == null || pattern.isBlank()) return;
    if (pattern.length() > 500
        || pattern.contains("(?<=")
        || pattern.contains("(?<!")
        || pattern.matches(".*\\\\[1-9].*")
        || pattern.matches(".*([+*}]\\s*){2,}.*")
        || pattern.matches(".*\\([^)]*[+*][^)]*\\)[+*{].*")) {
      throw badRequest("Regex validation không an toàn: " + field.getFieldKey());
    }
    try {
      Pattern.compile(pattern);
    } catch (PatternSyntaxException e) {
      throw badRequest("Regex validation không hợp lệ: " + field.getFieldKey());
    }
  }

  private void validateOptions(DocumentTemplateField field) {
    if (field.getInputType() != DocumentFieldInputType.SELECT
        && field.getInputType() != DocumentFieldInputType.MULTISELECT) {
      return;
    }
    if (field.getOptions() == null || field.getOptions().isEmpty()) {
      throw badRequest("Field lựa chọn phải có options: " + field.getFieldKey());
    }
    Set<String> unique = new LinkedHashSet<>();
    for (String option : field.getOptions()) {
      if (option == null || option.isBlank() || option.length() > 500 || !unique.add(option)) {
        throw badRequest("Options không hợp lệ hoặc bị trùng: " + field.getFieldKey());
      }
    }
  }

  private ResponseStatusException badRequest(String reason) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
  }
}

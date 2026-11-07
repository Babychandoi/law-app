package org.law_app.crm.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import org.law_app.crm.domain.MatterPartyRole;
import org.law_app.crm.domain.MatterPartyType;

/** API contracts for structured, encrypted parties attached to a legal matter. */
public final class MatterPartyDtos {
  private MatterPartyDtos() {}

  public record CreatePartyRequest(
      @NotNull MatterPartyRole role, @NotNull MatterPartyType type, @NotNull @Valid PartyPii pii) {}

  public record UpdatePartyRequest(
      @NotNull @PositiveOrZero Long revision,
      @NotNull MatterPartyRole role,
      @NotNull MatterPartyType type,
      @NotNull @Valid PartyPii pii) {}

  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record PartyPii(
      @NotBlank @Size(max = 240) String displayName,
      @Size(max = 120) String givenName,
      @Size(max = 120) String middleName,
      @Size(max = 120) String familyName,
      @Size(max = 240) String preferredName,
      @Size(max = 300) String legalName,
      @Email @Size(max = 254) String email,
      @Pattern(regexp = "^\\+?[0-9() .-]{7,30}$") String phone,
      @Past LocalDate dateOfBirth,
      @Pattern(regexp = "^[A-Z]{2}$") String nationalityCountryCode,
      @Size(max = 80) String identityDocumentType,
      @Size(max = 160) String identityDocumentNumber,
      @Pattern(regexp = "^[A-Z]{2}$") String identityIssuingCountryCode,
      LocalDate identityDocumentExpiresOn,
      @Size(max = 160) String taxIdentifier,
      @Size(max = 160) String registrationNumber,
      @Valid Address address,
      @Size(max = 4000) String notes) {}

  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record Address(
      @NotBlank @Size(max = 300) String line1,
      @Size(max = 300) String line2,
      @NotBlank @Size(max = 160) String locality,
      @Size(max = 160) String administrativeArea,
      @Size(max = 32) String postalCode,
      @NotNull @Pattern(regexp = "^[A-Z]{2}$") String countryCode) {}

  public record PartyView(
      String id,
      String caseId,
      MatterPartyRole role,
      MatterPartyType type,
      long revision,
      boolean archived,
      Instant archivedAt,
      Instant createdAt,
      Instant updatedAt,
      PartyPii pii) {}

  public record PageMeta(int page, int pageSize, long totalElements, int totalPages) {}
}

package org.law_app.crm.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import org.law_app.crm.domain.MatterPartyRole;
import org.law_app.crm.domain.MatterPartyType;

/** Request/response DTOs for the CRM operational API. */
public final class CrmDtos {
  private CrmDtos() {}

  /** A row in the advanced-filter result table. */
  public record CaseRow(
      String id,
      String customerEmail,
      String customerPhone,
      String serviceName,
      String name,
      String status,
      String assignedUserId,
      Long careStatusId,
      Date nextFollowUpAt,
      java.time.Instant lastCaredAt,
      Long lastCareResultId,
      List<Long> tagIds,
      Date caseCreatedAt) {}

  /**
   * Authorized case snapshot used by adjacent operational services (for example document
   * automation). It deliberately contains only case/customer facts already replicated into CRM;
   * care notes are exposed through their dedicated endpoint and are never copied implicitly.
   */
  public record CaseDetail(
      String id,
      String customerId,
      String customerEmail,
      String customerPhone,
      String serviceId,
      String serviceName,
      String name,
      String description,
      String status,
      String assignedUserId,
      Long careStatusId,
      List<Long> tagIds,
      Date caseCreatedAt,
      Date caseUpdatedAt,
      Instant syncedAt) {}

  /**
   * A deliberately minimized, authorized snapshot for a document-generation request.
   *
   * <p>The CRM case remains the system of record. This projection is not an export API: it omits
   * care notes, archived parties, encrypted payloads, identity-document details, and free-text
   * party notes. {@code matterReference} is currently the stable CRM case identifier until the
   * source system provides a separate legal-matter reference.
   */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record DocumentContext(
      int schemaVersion,
      String crmCaseId,
      String matterReference,
      String matterName,
      String customerId,
      String customerEmail,
      String customerPhone,
      String serviceId,
      String serviceName,
      String status,
      List<DocumentParty> parties) {}

  /**
   * A party projection safe for approved document automation. Exactly one of {@code person} or
   * {@code organization} is populated, according to {@code type}.
   */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record DocumentParty(
      String id,
      MatterPartyRole role,
      MatterPartyType type,
      String displayName,
      DocumentPerson person,
      DocumentOrganization organization) {}

  /**
   * Person facts required by common legal templates. Identity-document data, contact details, and
   * operator notes are intentionally excluded.
   */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record DocumentPerson(
      String givenName,
      String middleName,
      String familyName,
      String preferredName,
      LocalDate dateOfBirth,
      String nationalityCountryCode,
      DocumentAddress address) {}

  /**
   * Organization facts required by common legal templates. Contact details and internal notes are
   * intentionally excluded.
   */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record DocumentOrganization(
      String legalName, String registrationNumber, String taxIdentifier, DocumentAddress address) {}

  /** Postal address copied from encrypted party data only after authorization. */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record DocumentAddress(
      String line1,
      String line2,
      String locality,
      String administrativeArea,
      String postalCode,
      String countryCode) {}

  /** Record a care interaction. */
  public record CareLogRequest(
      @NotNull Long actionId,
      Long resultId,
      Long newStatusId,
      String note,
      Date followUpAt,
      List<Long> addTagIds) {}

  public record AssignRequest(String userId) {}

  public record TagsRequest(List<Long> tagIds) {}
}

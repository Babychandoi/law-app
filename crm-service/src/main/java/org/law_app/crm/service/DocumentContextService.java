package org.law_app.crm.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.DocumentContextAudit;
import org.law_app.crm.domain.MatterParty;
import org.law_app.crm.domain.MatterPartyType;
import org.law_app.crm.repository.DocumentContextAuditRepository;
import org.law_app.crm.repository.MatterPartyRepository;
import org.law_app.crm.web.CrmDtos.DocumentAddress;
import org.law_app.crm.web.CrmDtos.DocumentContext;
import org.law_app.crm.web.CrmDtos.DocumentOrganization;
import org.law_app.crm.web.CrmDtos.DocumentParty;
import org.law_app.crm.web.CrmDtos.DocumentPerson;
import org.law_app.crm.web.CurrentUser;
import org.law_app.crm.web.MatterPartyDtos.Address;
import org.law_app.crm.web.MatterPartyDtos.PartyPii;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Resolves the narrowly scoped CRM facts that an approved document automation request may use.
 *
 * <p>This service never returns ciphertext, identity-document data, party contact data, or internal
 * notes. It also emits only PII-free audit metadata after every successful resolution.
 */
@Service
@RequiredArgsConstructor
public class DocumentContextService {

  static final int RESPONSE_SCHEMA_VERSION = 1;

  private final CrmCaseService caseService;
  private final MatterPartyRepository partyRepository;
  private final DocumentContextAuditRepository auditRepository;
  private final PartyPiiCipher piiCipher;
  private final ObjectMapper objectMapper;

  @Transactional
  public DocumentContext resolve(String caseId) {
    CrmCase crmCase = authorize(caseId);
    piiCipher.requireAvailable();

    List<DocumentParty> parties =
        partyRepository.findByCaseIdAndArchivedFalseOrderByCreatedAtAsc(caseId).stream()
            .map(this::toDocumentParty)
            .toList();

    Instant resolvedAt = Instant.now();
    auditRepository.save(
        new DocumentContextAudit(
            crmCase.getId(),
            CurrentUser.id(),
            parties.size(),
            RESPONSE_SCHEMA_VERSION,
            resolvedAt));

    return new DocumentContext(
        RESPONSE_SCHEMA_VERSION,
        crmCase.getId(),
        crmCase.getId(),
        crmCase.getName(),
        crmCase.getCustomerId(),
        crmCase.getCustomerEmail(),
        crmCase.getCustomerPhone(),
        crmCase.getServiceId(),
        crmCase.getServiceName(),
        crmCase.getStatus(),
        parties);
  }

  private CrmCase authorize(String caseId) {
    CrmCase crmCase = caseService.requireCase(caseId);
    String actor = CurrentUser.id();
    if (actor == null || actor.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
    }
    if (!CurrentUser.isAdmin() && !Objects.equals(actor, crmCase.getAssignedUserId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only the assigned user or an administrator may access document context");
    }
    return crmCase;
  }

  private DocumentParty toDocumentParty(MatterParty party) {
    PartyPii pii = decrypt(party);
    return new DocumentParty(
        party.getId(),
        party.getRole(),
        party.getType(),
        pii.displayName(),
        party.getType() == MatterPartyType.PERSON ? toPerson(pii) : null,
        party.getType() == MatterPartyType.ORGANIZATION ? toOrganization(pii) : null);
  }

  private PartyPii decrypt(MatterParty party) {
    try {
      String plaintext =
          piiCipher.decrypt(party.getEncryptedPii(), MatterPartyService.encryptionContext(party));
      return objectMapper.readValue(plaintext, PartyPii.class);
    } catch (JsonProcessingException ex) {
      throw new PartyDataIntegrityException(ex);
    }
  }

  private static DocumentPerson toPerson(PartyPii pii) {
    return new DocumentPerson(
        pii.givenName(),
        pii.middleName(),
        pii.familyName(),
        pii.preferredName(),
        pii.dateOfBirth(),
        pii.nationalityCountryCode(),
        toAddress(pii.address()));
  }

  private static DocumentOrganization toOrganization(PartyPii pii) {
    return new DocumentOrganization(
        pii.legalName(), pii.registrationNumber(), pii.taxIdentifier(), toAddress(pii.address()));
  }

  private static DocumentAddress toAddress(Address address) {
    if (address == null) {
      return null;
    }
    return new DocumentAddress(
        address.line1(),
        address.line2(),
        address.locality(),
        address.administrativeArea(),
        address.postalCode(),
        address.countryCode());
  }
}

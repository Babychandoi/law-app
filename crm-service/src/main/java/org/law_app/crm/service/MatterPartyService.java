package org.law_app.crm.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.MatterParty;
import org.law_app.crm.domain.MatterPartyAudit;
import org.law_app.crm.domain.MatterPartyAuditAction;
import org.law_app.crm.domain.MatterPartyType;
import org.law_app.crm.repository.MatterPartyAuditRepository;
import org.law_app.crm.repository.MatterPartyRepository;
import org.law_app.crm.web.CurrentUser;
import org.law_app.crm.web.MatterPartyDtos.CreatePartyRequest;
import org.law_app.crm.web.MatterPartyDtos.PartyPii;
import org.law_app.crm.web.MatterPartyDtos.PartyView;
import org.law_app.crm.web.MatterPartyDtos.UpdatePartyRequest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MatterPartyService {

  private static final String ENCRYPTION_CONTEXT_PREFIX = "crm-matter-party-pii:v1";

  private final MatterPartyRepository partyRepository;
  private final MatterPartyAuditRepository auditRepository;
  private final CrmCaseService caseService;
  private final PartyPiiCipher piiCipher;
  private final ObjectMapper objectMapper;

  @Transactional
  public PartyView create(String caseId, CreatePartyRequest request) {
    String actor = authorize(caseId);
    piiCipher.requireAvailable();
    validateTypeSpecificData(request.type(), request.pii());

    Instant now = Instant.now();
    MatterParty party = new MatterParty();
    party.setId(UUID.randomUUID().toString());
    party.setCaseId(caseId);
    party.setRole(request.role());
    party.setType(request.type());
    party.setEncryptedPii(encrypt(request.pii(), party));
    party.setArchived(false);
    party.setCreatedAt(now);
    party.setCreatedBy(actor);
    party.setUpdatedAt(now);
    party.setUpdatedBy(actor);

    MatterParty saved = partyRepository.saveAndFlush(party);
    appendAudit(saved, MatterPartyAuditAction.CREATE, actor, now);
    return toView(saved);
  }

  @Transactional
  public Page<PartyView> list(String caseId, boolean includeArchived, Pageable pageable) {
    String actor = authorize(caseId);
    piiCipher.requireAvailable();

    Page<MatterParty> parties =
        includeArchived
            ? partyRepository.findByCaseId(caseId, pageable)
            : partyRepository.findByCaseIdAndArchivedFalse(caseId, pageable);
    Page<PartyView> views = parties.map(this::toView);

    Instant readAt = Instant.now();
    parties
        .getContent()
        .forEach(party -> appendAudit(party, MatterPartyAuditAction.READ, actor, readAt));
    return views;
  }

  @Transactional
  public PartyView get(String caseId, String partyId) {
    String actor = authorize(caseId);
    piiCipher.requireAvailable();
    MatterParty party = requireParty(caseId, partyId);
    PartyView view = toView(party);
    appendAudit(party, MatterPartyAuditAction.READ, actor, Instant.now());
    return view;
  }

  @Transactional
  public PartyView update(String caseId, String partyId, UpdatePartyRequest request) {
    String actor = authorize(caseId);
    piiCipher.requireAvailable();
    validateTypeSpecificData(request.type(), request.pii());

    MatterParty party = requireParty(caseId, partyId);
    requireCurrentRevision(party, request.revision());
    if (party.isArchived()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Archived parties cannot be modified");
    }

    Instant now = Instant.now();
    party.setRole(request.role());
    party.setType(request.type());
    party.setEncryptedPii(encrypt(request.pii(), party));
    party.setUpdatedAt(now);
    party.setUpdatedBy(actor);

    MatterParty saved = saveWithOptimisticLock(party);
    appendAudit(saved, MatterPartyAuditAction.UPDATE, actor, now);
    return toView(saved);
  }

  @Transactional
  public PartyView archive(String caseId, String partyId, long expectedRevision) {
    String actor = authorize(caseId);
    piiCipher.requireAvailable();

    MatterParty party = requireParty(caseId, partyId);
    requireCurrentRevision(party, expectedRevision);
    if (party.isArchived()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Party is already archived");
    }

    Instant now = Instant.now();
    party.setArchived(true);
    party.setArchivedAt(now);
    party.setArchivedBy(actor);
    party.setUpdatedAt(now);
    party.setUpdatedBy(actor);

    MatterParty saved = saveWithOptimisticLock(party);
    appendAudit(saved, MatterPartyAuditAction.ARCHIVE, actor, now);
    return toView(saved);
  }

  private String authorize(String caseId) {
    CrmCase crmCase = caseService.requireCase(caseId);
    String actor = CurrentUser.id();
    if (actor == null || actor.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
    }
    if (!CurrentUser.isAdmin() && !Objects.equals(actor, crmCase.getAssignedUserId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only the assigned user or an administrator may access matter parties");
    }
    return actor;
  }

  private MatterParty requireParty(String caseId, String partyId) {
    return partyRepository
        .findByIdAndCaseId(partyId, caseId)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matter party not found"));
  }

  private MatterParty saveWithOptimisticLock(MatterParty party) {
    try {
      return partyRepository.saveAndFlush(party);
    } catch (OptimisticLockingFailureException ex) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Matter party was modified by another user", ex);
    }
  }

  private void requireCurrentRevision(MatterParty party, long expectedRevision) {
    if (party.getRevision() != expectedRevision) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Revision conflict: reload the matter party before making changes");
    }
  }

  private void validateTypeSpecificData(MatterPartyType type, PartyPii pii) {
    if (type == MatterPartyType.ORGANIZATION
        && (pii.legalName() == null || pii.legalName().isBlank())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "legalName is required for an organization");
    }
    boolean hasDocumentType =
        pii.identityDocumentType() != null && !pii.identityDocumentType().isBlank();
    boolean hasDocumentNumber =
        pii.identityDocumentNumber() != null && !pii.identityDocumentNumber().isBlank();
    if (hasDocumentType != hasDocumentNumber) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "identityDocumentType and identityDocumentNumber must be supplied together");
    }
  }

  private String encrypt(PartyPii pii, MatterParty party) {
    try {
      String json = objectMapper.writeValueAsString(pii);
      return piiCipher.encrypt(json, encryptionContext(party));
    } catch (JsonProcessingException ex) {
      throw new PartyDataIntegrityException(ex);
    }
  }

  private PartyView toView(MatterParty party) {
    try {
      String json = piiCipher.decrypt(party.getEncryptedPii(), encryptionContext(party));
      PartyPii pii = objectMapper.readValue(json, PartyPii.class);
      return new PartyView(
          party.getId(),
          party.getCaseId(),
          party.getRole(),
          party.getType(),
          party.getRevision(),
          party.isArchived(),
          party.getArchivedAt(),
          party.getCreatedAt(),
          party.getUpdatedAt(),
          pii);
    } catch (JsonProcessingException ex) {
      throw new PartyDataIntegrityException(ex);
    }
  }

  /**
   * Binds encrypted PII to its immutable matter and party identities. Kept package-visible so the
   * separately scoped document-context projection can decrypt the same authenticated envelope
   * without duplicating this security-critical format.
   */
  static String encryptionContext(MatterParty party) {
    return ENCRYPTION_CONTEXT_PREFIX + '\0' + party.getCaseId() + '\0' + party.getId();
  }

  private void appendAudit(
      MatterParty party, MatterPartyAuditAction action, String actor, Instant occurredAt) {
    auditRepository.save(
        new MatterPartyAudit(
            party.getCaseId(),
            party.getId(),
            action,
            actor,
            party.getRole(),
            party.getType(),
            party.getRevision(),
            occurredAt));
  }
}

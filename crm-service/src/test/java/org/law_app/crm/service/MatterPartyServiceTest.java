package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.MatterParty;
import org.law_app.crm.domain.MatterPartyAudit;
import org.law_app.crm.domain.MatterPartyAuditAction;
import org.law_app.crm.domain.MatterPartyRole;
import org.law_app.crm.domain.MatterPartyType;
import org.law_app.crm.repository.MatterPartyAuditRepository;
import org.law_app.crm.repository.MatterPartyRepository;
import org.law_app.crm.web.MatterPartyDtos.Address;
import org.law_app.crm.web.MatterPartyDtos.CreatePartyRequest;
import org.law_app.crm.web.MatterPartyDtos.PartyPii;
import org.law_app.crm.web.MatterPartyDtos.UpdatePartyRequest;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MatterPartyServiceTest {

  private static final String CASE_ID = "case-1";
  private static final String PARTY_ID = "2f581250-3179-4ea2-b116-a5b84864f40a";
  private static final String CONTEXT_PREFIX = "crm-matter-party-pii:v1";

  @Mock private MatterPartyRepository partyRepository;
  @Mock private MatterPartyAuditRepository auditRepository;
  @Mock private CrmCaseService caseService;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
  private PartyPiiCipher cipher;
  private MatterPartyService service;

  @BeforeEach
  void setUp() {
    byte[] key = new byte[32];
    Arrays.fill(key, (byte) 31);
    cipher = new PartyPiiCipher(Base64.getEncoder().encodeToString(key));
    service =
        new MatterPartyService(partyRepository, auditRepository, caseService, cipher, objectMapper);
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void assignedUserCreatesEncryptedPartyAndPiiFreeAudit() {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    when(partyRepository.saveAndFlush(any(MatterParty.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    var result =
        service.create(
            CASE_ID,
            new CreatePartyRequest(
                MatterPartyRole.CLIENT, MatterPartyType.PERSON, validPersonPii()));

    ArgumentCaptor<MatterParty> partyCaptor = ArgumentCaptor.forClass(MatterParty.class);
    verify(partyRepository).saveAndFlush(partyCaptor.capture());
    MatterParty stored = partyCaptor.getValue();
    assertThat(stored.getEncryptedPii())
        .startsWith("v2.")
        .doesNotContain(
            validPersonPii().displayName(),
            validPersonPii().email(),
            validPersonPii().identityDocumentNumber());
    assertThat(result.pii()).isEqualTo(validPersonPii());
    assertThat(result.caseId()).isEqualTo(CASE_ID);

    ArgumentCaptor<MatterPartyAudit> auditCaptor = ArgumentCaptor.forClass(MatterPartyAudit.class);
    verify(auditRepository).save(auditCaptor.capture());
    MatterPartyAudit audit = auditCaptor.getValue();
    assertThat(audit.getAction()).isEqualTo(MatterPartyAuditAction.CREATE);
    assertThat(audit.getActorUserId()).isEqualTo("staff-1");
    assertThat(audit.getCaseId()).isEqualTo(CASE_ID);
    assertThat(audit.getPartyId()).isEqualTo(stored.getId());
  }

  @Test
  void nonAssigneeCannotAccessPartyData() {
    authenticate("staff-2", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");

    assertThatThrownBy(
            () ->
                service.create(
                    CASE_ID,
                    new CreatePartyRequest(
                        MatterPartyRole.CLIENT, MatterPartyType.PERSON, validPersonPii())))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    verifyNoInteractions(partyRepository, auditRepository);
  }

  @Test
  void administratorCanReadAnUnassignedCaseAndReadIsAudited() throws Exception {
    authenticate("admin-1", "ROLE_ADMIN");
    allowCaseAssignedTo(null);
    MatterParty stored = storedParty(2, false);
    PageRequest pageable = PageRequest.of(0, 30);
    when(partyRepository.findByCaseIdAndArchivedFalse(CASE_ID, pageable))
        .thenReturn(new PageImpl<>(List.of(stored), pageable, 1));

    var result = service.list(CASE_ID, false, pageable);

    assertThat(result.getContent())
        .singleElement()
        .extracting(view -> view.pii().displayName())
        .isEqualTo(validPersonPii().displayName());
    ArgumentCaptor<MatterPartyAudit> auditCaptor = ArgumentCaptor.forClass(MatterPartyAudit.class);
    verify(auditRepository).save(auditCaptor.capture());
    assertThat(auditCaptor.getValue().getAction()).isEqualTo(MatterPartyAuditAction.READ);
    assertThat(auditCaptor.getValue().getRevision()).isEqualTo(2);
  }

  @Test
  void missingEncryptionKeyFailsClosedWithoutTouchingPartyStorage() {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    MatterPartyService unavailableService =
        new MatterPartyService(
            partyRepository, auditRepository, caseService, new PartyPiiCipher(""), objectMapper);

    assertThatThrownBy(
            () ->
                unavailableService.create(
                    CASE_ID,
                    new CreatePartyRequest(
                        MatterPartyRole.CLIENT, MatterPartyType.PERSON, validPersonPii())))
        .isInstanceOf(PartyEncryptionUnavailableException.class);
    verifyNoInteractions(partyRepository, auditRepository);
  }

  @Test
  void staleRevisionIsRejectedBeforeMutation() throws Exception {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    MatterParty stored = storedParty(4, false);
    when(partyRepository.findByIdAndCaseId(PARTY_ID, CASE_ID)).thenReturn(Optional.of(stored));

    assertThatThrownBy(
            () ->
                service.update(
                    CASE_ID,
                    PARTY_ID,
                    new UpdatePartyRequest(
                        3L, MatterPartyRole.APPLICANT, MatterPartyType.PERSON, validPersonPii())))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    verify(partyRepository, never()).saveAndFlush(any());
    verifyNoInteractions(auditRepository);
  }

  @Test
  void databaseOptimisticLockFailureIsReturnedAsConflict() throws Exception {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    MatterParty stored = storedParty(4, false);
    when(partyRepository.findByIdAndCaseId(PARTY_ID, CASE_ID)).thenReturn(Optional.of(stored));
    when(partyRepository.saveAndFlush(stored))
        .thenThrow(new OptimisticLockingFailureException("concurrent update"));

    assertThatThrownBy(
            () ->
                service.update(
                    CASE_ID,
                    PARTY_ID,
                    new UpdatePartyRequest(
                        4L, MatterPartyRole.APPLICANT, MatterPartyType.PERSON, validPersonPii())))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    verifyNoInteractions(auditRepository);
  }

  @Test
  void archiveIsSoftDeleteAndRecordsActorAndAudit() throws Exception {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    MatterParty stored = storedParty(6, false);
    when(partyRepository.findByIdAndCaseId(PARTY_ID, CASE_ID)).thenReturn(Optional.of(stored));
    when(partyRepository.saveAndFlush(stored))
        .thenAnswer(
            invocation -> {
              stored.setRevision(7);
              return stored;
            });

    var result = service.archive(CASE_ID, PARTY_ID, 6);

    assertThat(result.archived()).isTrue();
    assertThat(result.revision()).isEqualTo(7);
    assertThat(stored.isArchived()).isTrue();
    assertThat(stored.getArchivedAt()).isNotNull();
    assertThat(stored.getArchivedBy()).isEqualTo("staff-1");
    verify(partyRepository, never()).delete(any(MatterParty.class));
    ArgumentCaptor<MatterPartyAudit> auditCaptor = ArgumentCaptor.forClass(MatterPartyAudit.class);
    verify(auditRepository).save(auditCaptor.capture());
    assertThat(auditCaptor.getValue().getAction()).isEqualTo(MatterPartyAuditAction.ARCHIVE);
    assertThat(auditCaptor.getValue().getRevision()).isEqualTo(7);
  }

  @Test
  void organizationRequiresLegalNameAndDocumentFieldsMustBePaired() {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    PartyPii withoutLegalName =
        new PartyPii(
            "Example Co.",
            null,
            null,
            null,
            null,
            null,
            "legal@example.com",
            "+12025550123",
            null,
            "US",
            null,
            null,
            null,
            null,
            null,
            "REG-1",
            null,
            null);

    assertThatThrownBy(
            () ->
                service.create(
                    CASE_ID,
                    new CreatePartyRequest(
                        MatterPartyRole.OWNER, MatterPartyType.ORGANIZATION, withoutLegalName)))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

    PartyPii unpairedDocument =
        new PartyPii(
            "Nguyen Van An",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "VN",
            "PASSPORT",
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThatThrownBy(
            () ->
                service.create(
                    CASE_ID,
                    new CreatePartyRequest(
                        MatterPartyRole.CLIENT, MatterPartyType.PERSON, unpairedDocument)))
        .isInstanceOfSatisfying(
            ResponseStatusException.class,
            ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    verifyNoInteractions(partyRepository, auditRepository);
  }

  @Test
  void corruptedPiiNeverProducesAResponseOrSuccessfulReadAudit() {
    authenticate("staff-1", "ROLE_STAFF");
    allowCaseAssignedTo("staff-1");
    MatterParty stored = bareStoredParty(1, false);
    stored.setEncryptedPii("v1.invalid.invalid");
    when(partyRepository.findByIdAndCaseId(PARTY_ID, CASE_ID)).thenReturn(Optional.of(stored));

    assertThatThrownBy(() -> service.get(CASE_ID, PARTY_ID))
        .isInstanceOf(PartyDataIntegrityException.class);
    verifyNoInteractions(auditRepository);
  }

  private void authenticate(String userId, String authority) {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                userId, "n/a", List.of(new SimpleGrantedAuthority(authority))));
  }

  private void allowCaseAssignedTo(String userId) {
    when(caseService.requireCase(CASE_ID))
        .thenReturn(CrmCase.builder().id(CASE_ID).assignedUserId(userId).build());
  }

  private MatterParty storedParty(long revision, boolean archived) throws Exception {
    MatterParty party = bareStoredParty(revision, archived);
    String json = objectMapper.writeValueAsString(validPersonPii());
    party.setEncryptedPii(
        cipher.encrypt(json, CONTEXT_PREFIX + '\0' + party.getCaseId() + '\0' + party.getId()));
    return party;
  }

  private MatterParty bareStoredParty(long revision, boolean archived) {
    MatterParty party = new MatterParty();
    party.setId(PARTY_ID);
    party.setCaseId(CASE_ID);
    party.setRole(MatterPartyRole.CLIENT);
    party.setType(MatterPartyType.PERSON);
    party.setRevision(revision);
    party.setArchived(archived);
    party.setCreatedAt(Instant.parse("2026-07-29T00:00:00Z"));
    party.setCreatedBy("staff-1");
    party.setUpdatedAt(Instant.parse("2026-07-29T00:00:00Z"));
    party.setUpdatedBy("staff-1");
    return party;
  }

  private PartyPii validPersonPii() {
    return new PartyPii(
        "Nguyễn Văn An",
        "An",
        null,
        "Nguyễn",
        null,
        null,
        "an@example.com",
        "+84 912 345 678",
        LocalDate.of(1990, 1, 1),
        "VN",
        "PASSPORT",
        "P1234567",
        "VN",
        LocalDate.of(2030, 1, 1),
        null,
        null,
        new Address("12 Nguyễn Huệ", null, "Hồ Chí Minh", null, "700000", "VN"),
        null);
  }
}

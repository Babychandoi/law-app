package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.hasText;
import static org.law_app.crm.service.CrmSupport.newId;
import static org.law_app.crm.service.CrmSupport.parseTrailingNumber;
import static org.law_app.crm.service.CrmSupport.toJsonList;

import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.CrmLead;
import org.law_app.crm.event.CaseEvent;
import org.law_app.crm.repository.CrmLeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Idempotently syncs website CaseEvents (and existing CrmCase rows) into CrmLead. */
@Slf4j
@Service
@RequiredArgsConstructor
public class CrmLeadSyncService {

  private final CrmLeadRepository leadRepo;

  @Transactional
  public CrmLead syncFromCaseEvent(CaseEvent event) {
    if (event == null || !hasText(event.getCaseId())) {
      return null;
    }
    if (leadRepo.existsBySourceCaseId(event.getCaseId())) {
      return null;
    }
    String name =
        hasText(event.getName())
            ? event.getName().trim()
            : (hasText(event.getCustomerEmail())
                ? event.getCustomerEmail().trim()
                : "Khách hàng Website");
    Instant createdAt =
        event.getCreatedAt() != null ? event.getCreatedAt().toInstant() : Instant.now();
    var intake =
        CrmLeadDescriptionNormalizer.normalize(event.getDescription(), event.getServiceName());

    CrmLead lead =
        CrmLead.builder()
            .id(newId())
            .code(nextLeadCode(leadRepo))
            .sourceCaseId(event.getCaseId())
            .tags(toJsonList(intake.suggestedTags()))
            .customerName(name)
            .fullName(name)
            .phone(event.getCustomerPhone())
            .personalEmail(event.getCustomerEmail())
            .serviceGroups(toJsonList(intake.suggestedServiceGroups()))
            .demandDetail(intake.normalizedDemandDetail())
            .leadSource(intake.suggestedLeadSource())
            .customerStatus("3/ Tiềm năng")
            .country("Việt Nam")
            .createdBy("system")
            .updatedBy("system")
            .createdAt(createdAt)
            .updatedAt(Instant.now())
            .build();

    CrmLead saved = leadRepo.save(lead);
    log.debug("Created CRM lead {} from website case {}", saved.getCode(), event.getCaseId());
    return saved;
  }

  @Transactional
  public int backfillFromCases(List<CrmCase> cases) {
    if (cases == null || cases.isEmpty()) {
      return 0;
    }
    int count = 0;
    for (CrmCase c : cases) {
      if (c == null || !hasText(c.getId())) {
        continue;
      }
      var existingOpt = leadRepo.findBySourceCaseId(c.getId());
      if (existingOpt.isPresent()) {
        CrmLead existing = existingOpt.get();
        boolean dirty = false;
        if ("system".equals(existing.getCreatedBy()) && "system".equals(existing.getUpdatedBy())) {
          if ("Nữ".equals(existing.getGender())) {
            existing.setGender(null);
            dirty = true;
          }
          if (CrmLeadDescriptionNormalizer.hasRawBracketMetadata(existing.getDemandDetail())) {
            var intake =
                CrmLeadDescriptionNormalizer.normalize(
                    existing.getDemandDetail(), c.getServiceName());
            existing.setDemandDetail(intake.normalizedDemandDetail());
            existing.setLeadSource(intake.suggestedLeadSource());
            if (!intake.suggestedServiceGroups().isEmpty()) {
              existing.setServiceGroups(toJsonList(intake.suggestedServiceGroups()));
            }
            if (!hasText(existing.getTags()) && !intake.suggestedTags().isEmpty()) {
              existing.setTags(toJsonList(intake.suggestedTags()));
            }
            dirty = true;
          }
        }
        if (dirty) {
          leadRepo.save(existing);
        }
        continue;
      }
      String name =
          hasText(c.getName())
              ? c.getName().trim()
              : (hasText(c.getCustomerEmail())
                  ? c.getCustomerEmail().trim()
                  : "Khách hàng Website");
      Instant createdAt =
          c.getCaseCreatedAt() != null ? c.getCaseCreatedAt().toInstant() : Instant.now();
      var intake = CrmLeadDescriptionNormalizer.normalize(c.getDescription(), c.getServiceName());

      CrmLead lead =
          CrmLead.builder()
              .id(newId())
              .code(nextLeadCode(leadRepo))
              .sourceCaseId(c.getId())
              .tags(toJsonList(intake.suggestedTags()))
              .customerName(name)
              .fullName(name)
              .phone(c.getCustomerPhone())
              .personalEmail(c.getCustomerEmail())
              .serviceGroups(toJsonList(intake.suggestedServiceGroups()))
              .demandDetail(intake.normalizedDemandDetail())
              .assignedUserId(c.getAssignedUserId())
              .leadSource(intake.suggestedLeadSource())
              .customerStatus("3/ Tiềm năng")
              .country("Việt Nam")
              .createdBy("system")
              .updatedBy("system")
              .createdAt(createdAt)
              .updatedAt(Instant.now())
              .build();
      leadRepo.save(lead);
      count++;
    }
    return count;
  }

  static String nextLeadCode(CrmLeadRepository repo) {
    int max =
        repo.findTopByCodeStartingWithOrderByCodeDesc("TN")
            .map(l -> parseTrailingNumber(l.getCode(), "TN"))
            .orElse(0);
    int seq = max + 1;
    String candidate = String.format("TN%06d", seq);
    while (repo.existsByCode(candidate)) {
      seq++;
      candidate = String.format("TN%06d", seq);
    }
    return candidate;
  }
}

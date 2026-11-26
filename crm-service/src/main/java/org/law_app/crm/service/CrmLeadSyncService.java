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
    List<String> groups =
        hasText(event.getServiceName()) ? List.of(event.getServiceName().trim()) : List.of();
    Instant createdAt =
        event.getCreatedAt() != null ? event.getCreatedAt().toInstant() : Instant.now();

    CrmLead lead =
        CrmLead.builder()
            .id(newId())
            .code(nextLeadCode(leadRepo))
            .sourceCaseId(event.getCaseId())
            .customerName(name)
            .fullName(name)
            .phone(event.getCustomerPhone())
            .personalEmail(event.getCustomerEmail())
            .serviceGroups(toJsonList(groups))
            .demandDetail(event.getDescription())
            .leadSource("6/ Website")
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
        if ("system".equals(existing.getCreatedBy())
            && "system".equals(existing.getUpdatedBy())
            && "Nữ".equals(existing.getGender())) {
          existing.setGender(null);
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
      List<String> groups =
          hasText(c.getServiceName()) ? List.of(c.getServiceName().trim()) : List.of();
      Instant createdAt =
          c.getCaseCreatedAt() != null ? c.getCaseCreatedAt().toInstant() : Instant.now();

      CrmLead lead =
          CrmLead.builder()
              .id(newId())
              .code(nextLeadCode(leadRepo))
              .sourceCaseId(c.getId())
              .customerName(name)
              .fullName(name)
              .phone(c.getCustomerPhone())
              .personalEmail(c.getCustomerEmail())
              .serviceGroups(toJsonList(groups))
              .demandDetail(c.getDescription())
              .assignedUserId(c.getAssignedUserId())
              .leadSource("6/ Website")
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

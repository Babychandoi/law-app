package org.law_app.crm.service;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CareLog;
import org.law_app.crm.domain.CaseTag;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.repository.CareLogRepository;
import org.law_app.crm.repository.CaseTagRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.web.CrmDtos.CareLogRequest;
import org.law_app.crm.web.CrmDtos.CaseRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmCaseService {

  private final CrmCaseRepository caseRepo;
  private final CaseTagRepository caseTagRepo;
  private final CareLogRepository careLogRepo;

  /** Advanced filter -> SQL via Specification (paginated). */
  public Page<CaseRow> search(
      String me,
      String keyword,
      String status,
      Long careStatusId,
      String assignedTo, // "me" | "none" | userId | null
      String followUp, // "today" | "overdue" | "next7" | "none" | null
      Long tagId,
      Pageable pageable) {

    Specification<CrmCase> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();

          if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("customerEmail")), like),
                    cb.like(cb.lower(root.get("customerPhone")), like),
                    cb.like(cb.lower(root.get("name")), like)));
          }
          if (status != null && !status.isBlank()) {
            ps.add(cb.equal(root.get("status"), status));
          }
          if (careStatusId != null) {
            ps.add(cb.equal(root.get("careStatusId"), careStatusId));
          }
          if (assignedTo != null && !assignedTo.isBlank()) {
            switch (assignedTo) {
              case "me" -> ps.add(cb.equal(root.get("assignedUserId"), me));
              case "none" -> ps.add(cb.isNull(root.get("assignedUserId")));
              case "any" -> ps.add(cb.isNotNull(root.get("assignedUserId")));
              default -> ps.add(cb.equal(root.get("assignedUserId"), assignedTo));
            }
          }
          if (followUp != null && !followUp.isBlank()) {
            ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
            LocalDate today = LocalDate.now(zone);
            Date startToday = Date.from(today.atStartOfDay(zone).toInstant());
            Date endToday = Date.from(today.plusDays(1).atStartOfDay(zone).toInstant());
            switch (followUp) {
              case "today" ->
                  ps.add(
                      cb.and(
                          cb.greaterThanOrEqualTo(root.get("nextFollowUpAt"), startToday),
                          cb.lessThan(root.get("nextFollowUpAt"), endToday)));
              case "overdue" ->
                  ps.add(
                      cb.and(
                          cb.isNotNull(root.get("nextFollowUpAt")),
                          cb.lessThan(root.get("nextFollowUpAt"), startToday)));
              case "next7" -> {
                Date end7 = Date.from(today.plusDays(8).atStartOfDay(zone).toInstant());
                ps.add(
                    cb.and(
                        cb.greaterThanOrEqualTo(root.get("nextFollowUpAt"), startToday),
                        cb.lessThan(root.get("nextFollowUpAt"), end7)));
              }
              case "none" -> ps.add(cb.isNull(root.get("nextFollowUpAt")));
              default -> {}
            }
          }
          if (tagId != null) {
            // subquery: case ids having this tag
            var sub = query.subquery(String.class);
            var tagRoot = sub.from(CaseTag.class);
            sub.select(tagRoot.get("caseId")).where(cb.equal(tagRoot.get("tagId"), tagId));
            ps.add(root.get("id").in(sub));
          }
          return cb.and(ps.toArray(new Predicate[0]));
        };

    return caseRepo.findAll(spec, pageable).map(this::toRow);
  }

  public CrmCase requireCase(String id) {
    return caseRepo
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found"));
  }

  public CaseRow assign(String caseId, String userId) {
    CrmCase c = requireCase(caseId);
    c.setAssignedUserId(userId);
    return toRow(caseRepo.save(c));
  }

  public List<CareLog> history(String caseId) {
    requireCase(caseId);
    return careLogRepo.findByCaseIdOrderByCreatedAtDesc(caseId);
  }

  /** Record a care interaction and roll the result up onto the case. */
  public CareLog recordCare(String caseId, String staffId, CareLogRequest req) {
    CrmCase c = requireCase(caseId);
    Instant now = Instant.now();

    CareLog log =
        careLogRepo.save(
            CareLog.builder()
                .caseId(caseId)
                .staffId(staffId)
                .actionId(req.actionId())
                .resultId(req.resultId())
                .newStatusId(req.newStatusId())
                .note(req.note())
                .followUpAt(req.followUpAt())
                .createdAt(now)
                .build());

    // Roll up onto the case snapshot.
    c.setLastCaredAt(now);
    if (req.newStatusId() != null) c.setCareStatusId(req.newStatusId());
    if (req.resultId() != null) c.setLastCareResultId(req.resultId());
    if (req.followUpAt() != null) c.setNextFollowUpAt(req.followUpAt());
    caseRepo.save(c);

    // Add tags if requested.
    if (req.addTagIds() != null) {
      for (Long tagId : req.addTagIds()) {
        if (!caseTagRepo.existsByCaseIdAndTagId(caseId, tagId)) {
          caseTagRepo.save(CaseTag.builder().caseId(caseId).tagId(tagId).build());
        }
      }
    }
    return log;
  }

  public CaseRow setTags(String caseId, List<Long> tagIds) {
    CrmCase c = requireCase(caseId);
    caseTagRepo.findByCaseId(caseId).forEach(ct -> caseTagRepo.delete(ct));
    if (tagIds != null) {
      for (Long tagId : tagIds) {
        caseTagRepo.save(CaseTag.builder().caseId(caseId).tagId(tagId).build());
      }
    }
    return toRow(c);
  }

  private CaseRow toRow(CrmCase c) {
    List<Long> tagIds = caseTagRepo.findByCaseId(c.getId()).stream().map(CaseTag::getTagId).toList();
    return new CaseRow(
        c.getId(),
        c.getCustomerEmail(),
        c.getCustomerPhone(),
        c.getServiceName(),
        c.getName(),
        c.getStatus(),
        c.getAssignedUserId(),
        c.getCareStatusId(),
        c.getNextFollowUpAt(),
        c.getLastCaredAt(),
        c.getLastCareResultId(),
        tagIds,
        c.getCaseCreatedAt());
  }
}

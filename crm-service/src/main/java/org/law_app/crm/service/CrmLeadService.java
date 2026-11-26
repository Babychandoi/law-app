package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.VN_ZONE;
import static org.law_app.crm.service.CrmSupport.addTagToJsonList;
import static org.law_app.crm.service.CrmSupport.assignedPredicate;
import static org.law_app.crm.service.CrmSupport.blankToDefault;
import static org.law_app.crm.service.CrmSupport.currentActorId;
import static org.law_app.crm.service.CrmSupport.currentActorName;
import static org.law_app.crm.service.CrmSupport.endExclusiveInstant;
import static org.law_app.crm.service.CrmSupport.fromJsonList;
import static org.law_app.crm.service.CrmSupport.hasText;
import static org.law_app.crm.service.CrmSupport.money;
import static org.law_app.crm.service.CrmSupport.newId;
import static org.law_app.crm.service.CrmSupport.removeTagFromJsonList;
import static org.law_app.crm.service.CrmSupport.startOfDayInstant;
import static org.law_app.crm.service.CrmSupport.toJsonList;
import static org.law_app.crm.service.CrmSupport.trimOrNull;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmLead;
import org.law_app.crm.repository.CrmLeadRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLeadDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadConvertResponse;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityUpsertRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmLeadService {

  private final CrmLeadRepository leadRepo;
  private final CrmAccountService accountService;
  private final CrmOpportunityService opportunityService;

  @Transactional(readOnly = true)
  public Page<CrmLeadDto> search(
      String me,
      String keyword,
      String customerStatus,
      String leadSource,
      String assignedTo,
      String serviceGroup,
      String province,
      LocalDate from,
      LocalDate to,
      Pageable pageable) {
    return search(
        me,
        keyword,
        customerStatus,
        leadSource,
        assignedTo,
        serviceGroup,
        province,
        from,
        to,
        null,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmLeadDto> search(
      String me,
      String keyword,
      String customerStatus,
      String leadSource,
      String assignedTo,
      String serviceGroup,
      String province,
      LocalDate from,
      LocalDate to,
      String filters,
      Pageable pageable) {
    return search(
        me,
        keyword,
        customerStatus,
        leadSource,
        assignedTo,
        serviceGroup,
        province,
        from,
        to,
        filters,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmLeadDto> search(
      String me,
      String keyword,
      String customerStatus,
      String leadSource,
      String assignedTo,
      String serviceGroup,
      String province,
      LocalDate from,
      LocalDate to,
      String filters,
      boolean trashed,
      Pageable pageable) {

    List<CrmDynamicFilterSpec.FilterRule> filterRules = CrmDynamicFilterSpec.parseRules(filters);

    Specification<CrmLead> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();
          ps.add(trashed ? cb.isTrue(root.get("deleted")) : cb.isFalse(root.get("deleted")));
          if (hasText(keyword)) {
            String like = "%" + keyword.trim().toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("customerName")), like),
                    cb.like(cb.lower(root.get("fullName")), like),
                    cb.like(cb.lower(root.get("phone")), like),
                    cb.like(cb.lower(root.get("personalEmail")), like),
                    cb.like(cb.lower(root.get("workEmail")), like),
                    cb.like(cb.lower(root.get("taxCode")), like),
                    cb.like(cb.lower(root.get("organizationName")), like)));
          }
          if (hasText(customerStatus)) {
            ps.add(cb.equal(root.get("customerStatus"), customerStatus.trim()));
          }
          if (hasText(leadSource)) {
            ps.add(cb.equal(root.get("leadSource"), leadSource.trim()));
          }
          Predicate assigned = assignedPredicate(cb, root, assignedTo, me);
          if (assigned != null) {
            ps.add(assigned);
          }
          if (hasText(serviceGroup)) {
            ps.add(
                cb.like(
                    cb.lower(root.get("serviceGroups")),
                    "%" + serviceGroup.trim().toLowerCase() + "%"));
          }
          if (hasText(province)) {
            ps.add(
                cb.like(cb.lower(root.get("province")), "%" + province.trim().toLowerCase() + "%"));
          }
          if (from != null) {
            ps.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startOfDayInstant(from)));
          }
          if (to != null) {
            ps.add(cb.lessThan(root.get("createdAt"), endExclusiveInstant(to)));
          }
          ps.addAll(
              CrmDynamicFilterSpec.buildPredicates(
                  filterRules, CrmDynamicFilterSpec.LEAD_FIELDS, root, cb));
          return cb.and(ps.toArray(new Predicate[0]));
        };

    return leadRepo.findAll(spec, pageable).map(this::toDto);
  }

  @Transactional(readOnly = true)
  public CrmLeadDto get(String id) {
    return toDto(requireLead(id));
  }

  @Transactional
  public CrmLeadDto create(LeadUpsertRequest req) {
    Instant now = Instant.now();
    String actor = currentActorId();

    CrmLead lead = new CrmLead();
    lead.setId(newId());
    lead.setCode(
        hasText(req.code()) ? req.code().trim() : CrmLeadSyncService.nextLeadCode(leadRepo));
    lead.setCreatedBy(actor);
    lead.setUpdatedBy(actor);
    lead.setCreatedAt(now);
    lead.setUpdatedAt(now);

    applyFields(lead, req);
    return toDto(leadRepo.save(lead));
  }

  @Transactional
  public CrmLeadDto update(String id, LeadUpsertRequest req) {
    CrmLead lead = requireLead(id);
    if (hasText(req.code())) {
      lead.setCode(req.code().trim());
    }
    lead.setUpdatedBy(currentActorId());
    lead.setUpdatedAt(Instant.now());

    applyFields(lead, req);
    return toDto(leadRepo.save(lead));
  }

  @Transactional
  public void delete(String id) {
    CrmLead lead = requireLead(id);
    Instant now = Instant.now();
    lead.setDeleted(true);
    lead.setDeletedAt(now);
    lead.setDeletedBy(currentActorName());
    lead.setUpdatedAt(now);
    lead.setUpdatedBy(currentActorId());
    leadRepo.save(lead);
  }

  @Transactional
  public CrmLeadDto restore(String id) {
    CrmLead lead = requireLead(id);
    lead.setDeleted(false);
    lead.setDeletedAt(null);
    lead.setDeletedBy(null);
    lead.setUpdatedAt(Instant.now());
    lead.setUpdatedBy(currentActorId());
    return toDto(leadRepo.save(lead));
  }

  @Transactional
  public void permanentDelete(String id) {
    CrmLead lead = requireLead(id);
    leadRepo.delete(lead);
  }

  @Transactional
  public int bulkAction(BulkActionRequest req) {
    if (req == null || req.ids() == null || req.ids().isEmpty() || !hasText(req.action())) {
      return 0;
    }
    List<String> ids =
        req.ids().stream().filter(CrmSupport::hasText).map(String::trim).distinct().toList();
    if (ids.isEmpty()) {
      return 0;
    }
    String action = req.action().trim().toUpperCase(Locale.ROOT);
    if (("ADD_TAG".equals(action) || "REMOVE_TAG".equals(action)) && !hasText(req.tag())) {
      return 0;
    }

    List<CrmLead> rows = leadRepo.findAllById(ids);
    Instant now = Instant.now();
    String actorId = currentActorId();
    String actorName = currentActorName();
    int affected = 0;

    for (CrmLead lead : rows) {
      switch (action) {
        case "ASSIGN" -> {
          lead.setAssignedUserId(trimOrNull(req.assignedUserId()));
          lead.setAssignedUserName(trimOrNull(req.assignedUserName()));
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "SHARE" -> {
          lead.setShared(req.shared() != null ? req.shared() : true);
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "UNSHARE" -> {
          lead.setShared(false);
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "ADD_TAG" -> {
          lead.setTags(addTagToJsonList(lead.getTags(), req.tag()));
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "REMOVE_TAG" -> {
          lead.setTags(removeTagFromJsonList(lead.getTags(), req.tag()));
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "DELETE" -> {
          lead.setDeleted(true);
          lead.setDeletedAt(now);
          lead.setDeletedBy(actorName);
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "RESTORE" -> {
          lead.setDeleted(false);
          lead.setDeletedAt(null);
          lead.setDeletedBy(null);
          lead.setUpdatedAt(now);
          lead.setUpdatedBy(actorId);
          leadRepo.save(lead);
          affected++;
        }
        case "PERMANENT_DELETE" -> {
          leadRepo.delete(lead);
          affected++;
        }
        default ->
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Unsupported bulk action: " + req.action());
      }
    }
    return affected;
  }

  @Transactional
  public LeadConvertResponse convert(String id, LeadConvertRequest req) {
    CrmLead lead = requireLead(id);
    LeadConvertRequest safeReq =
        req != null ? req : new LeadConvertRequest(false, null, null, null);
    boolean shouldCreateOpportunity = Boolean.TRUE.equals(safeReq.createOpportunity());

    String accountCustomerName =
        hasText(lead.getOrganizationName())
            ? lead.getOrganizationName()
            : blankToDefault(lead.getCustomerName(), lead.getFullName());
    String primaryContactName =
        hasText(lead.getFullName()) ? lead.getFullName() : lead.getCustomerName();
    String primaryEmail =
        hasText(lead.getWorkEmail()) ? lead.getWorkEmail() : lead.getPersonalEmail();
    boolean individual = !hasText(lead.getOrganizationName()) && !hasText(lead.getTaxCode());
    List<String> groups = fromJsonList(lead.getServiceGroups());
    List<String> tags = fromJsonList(lead.getTags());

    AccountUpsertRequest accountReq =
        new AccountUpsertRequest(
            null,
            lead.getId(),
            tags,
            accountCustomerName,
            lead.getPhone(),
            List.of("Đang chăm sóc"),
            shouldCreateOpportunity ? "Tiềm năng" : "Đã chốt hợp đồng",
            null,
            lead.getLeadSource(),
            lead.getAssignedUserId(),
            lead.getAssignedUserName(),
            lead.getOwnerUserId(),
            lead.getOwnerUserName(),
            null,
            groups,
            groups.isEmpty() ? null : String.join(", ", groups),
            lead.getTaxCode(),
            List.of(),
            primaryEmail,
            "Chưa xếp hạng",
            primaryContactName,
            lead.getJobTitle(),
            lead.getPhone(),
            hasText(lead.getPersonalEmail()) ? lead.getPersonalEmail() : primaryEmail,
            lead.getBirthDate(),
            lead.getDemandDetail(),
            lead.getProvince(),
            lead.getDistrict(),
            lead.getAddress(),
            lead.getCompanySize(),
            null,
            "Không xác định",
            lead.getWebsite(),
            null,
            lead.isShared(),
            individual,
            false,
            null);

    CrmAccountDto createdAccount = accountService.create(accountReq);

    String createdOpportunityId = null;
    if (shouldCreateOpportunity) {
      String oppName =
          hasText(safeReq.opportunityName())
              ? safeReq.opportunityName().trim()
              : "Cơ hội - " + createdAccount.customerName();
      BigDecimal expectedRev =
          safeReq.expectedRevenue() != null ? money(safeReq.expectedRevenue()) : BigDecimal.ZERO;
      String stage = blankToDefault(safeReq.stage(), CrmOpportunityService.CANONICAL_STAGES.get(0));

      OpportunityUpsertRequest oppReq =
          new OpportunityUpsertRequest(
              null,
              tags,
              oppName,
              createdAccount.id(),
              createdAccount.customerName(),
              primaryContactName,
              lead.getPhone(),
              expectedRev,
              stage,
              LocalDate.now(VN_ZONE).plusDays(14),
              List.of("Khách hàng mới"),
              groups,
              lead.getLeadSource(),
              lead.getAssignedUserId(),
              lead.getAssignedUserName(),
              lead.isShared(),
              null,
              lead.getDemandDetail(),
              null,
              List.of());

      CrmOpportunityDto createdOpp = opportunityService.create(oppReq);
      createdOpportunityId = createdOpp.id();
    }

    Instant now = Instant.now();
    lead.setCustomerStatus("1/ Chốt hợp đồng");
    lead.setConvertedAccountId(createdAccount.id());
    lead.setConvertedOpportunityId(createdOpportunityId);
    lead.setConvertedAt(now);
    lead.setLastInteractedAt(now);
    lead.setUpdatedBy(currentActorId());
    lead.setUpdatedAt(now);
    leadRepo.save(lead);

    return new LeadConvertResponse(lead.getId(), createdAccount.id(), createdOpportunityId);
  }

  @Transactional
  public int importLeads(List<LeadUpsertRequest> items) {
    if (items == null || items.isEmpty()) {
      return 0;
    }
    for (LeadUpsertRequest item : items) {
      create(item);
    }
    return items.size();
  }

  public CrmLead requireLead(String id) {
    return leadRepo
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
  }

  private void applyFields(CrmLead lead, LeadUpsertRequest req) {
    if (hasText(req.sourceCaseId())) {
      lead.setSourceCaseId(req.sourceCaseId().trim());
    }
    lead.setTags(toJsonList(req.tags()));

    String customerName = trimOrNull(req.customerName());
    String fullName = trimOrNull(req.fullName());
    if (!hasText(customerName) && hasText(fullName)) {
      customerName = fullName;
    } else if (!hasText(fullName) && hasText(customerName)) {
      fullName = customerName;
    }
    if (!hasText(customerName) && !hasText(fullName)) {
      customerName = "Khách hàng liên hệ";
      fullName = customerName;
    }
    lead.setCustomerName(customerName);
    lead.setFullName(fullName);

    lead.setPhone(trimOrNull(req.phone()));
    lead.setTaxCode(trimOrNull(req.taxCode()));
    lead.setPersonalEmail(trimOrNull(req.personalEmail()));
    lead.setWorkEmail(trimOrNull(req.workEmail()));
    lead.setServiceGroups(toJsonList(req.serviceGroups()));
    lead.setJobTitle(trimOrNull(req.jobTitle()));
    lead.setAssignedUserId(trimOrNull(req.assignedUserId()));
    lead.setAssignedUserName(trimOrNull(req.assignedUserName()));
    lead.setOwnerUserId(
        hasText(req.ownerUserId())
            ? req.ownerUserId().trim()
            : (hasText(req.assignedUserId())
                ? req.assignedUserId().trim()
                : lead.getOwnerUserId()));
    lead.setOwnerUserName(
        hasText(req.ownerUserName())
            ? req.ownerUserName().trim()
            : (hasText(req.assignedUserName())
                ? req.assignedUserName().trim()
                : lead.getOwnerUserName()));
    String rawDemand = trimOrNull(req.demandDetail());
    if (CrmLeadDescriptionNormalizer.hasRawBracketMetadata(rawDemand)) {
      var intake = CrmLeadDescriptionNormalizer.normalize(rawDemand, null);
      lead.setDemandDetail(intake.normalizedDemandDetail());
      lead.setLeadSource(blankToDefault(req.leadSource(), intake.suggestedLeadSource()));
      if ((req.tags() == null || req.tags().isEmpty()) && !intake.suggestedTags().isEmpty()) {
        lead.setTags(toJsonList(intake.suggestedTags()));
      }
      if ((req.serviceGroups() == null || req.serviceGroups().isEmpty())
          && !intake.suggestedServiceGroups().isEmpty()) {
        lead.setServiceGroups(toJsonList(intake.suggestedServiceGroups()));
      }
    } else {
      lead.setLeadSource(blankToDefault(req.leadSource(), "6/ Website"));
      lead.setDemandDetail(rawDemand);
    }
    lead.setCustomerStatus(blankToDefault(req.customerStatus(), "3/ Tiềm năng"));
    lead.setOrganizationName(trimOrNull(req.organizationName()));
    lead.setGender(trimOrNull(req.gender()));
    lead.setZalo(trimOrNull(req.zalo()));
    lead.setWebsite(trimOrNull(req.website()));
    lead.setBirthDate(req.birthDate());
    lead.setCompanySize(trimOrNull(req.companySize()));
    lead.setCountry(blankToDefault(req.country(), "Việt Nam"));
    lead.setProvince(trimOrNull(req.province()));
    lead.setDistrict(trimOrNull(req.district()));
    lead.setAddress(trimOrNull(req.address()));
    if (req.shared() != null) {
      lead.setShared(req.shared());
    }
    lead.setDepartment(trimOrNull(req.department()));
    if (req.lastInteractedAt() != null) {
      lead.setLastInteractedAt(req.lastInteractedAt());
    }
  }

  private CrmLeadDto toDto(CrmLead l) {
    return new CrmLeadDto(
        l.getId(),
        l.getCode(),
        l.getSourceCaseId(),
        fromJsonList(l.getTags()),
        l.getCustomerName(),
        l.getFullName(),
        l.getPhone(),
        l.getTaxCode(),
        l.getPersonalEmail(),
        l.getWorkEmail(),
        fromJsonList(l.getServiceGroups()),
        l.getJobTitle(),
        l.getAssignedUserId(),
        l.getAssignedUserName(),
        l.getOwnerUserId(),
        l.getOwnerUserName(),
        l.getLeadSource(),
        l.getCustomerStatus(),
        l.getDemandDetail(),
        l.getOrganizationName(),
        l.getGender(),
        l.getZalo(),
        l.getWebsite(),
        l.getBirthDate(),
        l.getCompanySize(),
        l.getCountry(),
        l.getProvince(),
        l.getDistrict(),
        l.getAddress(),
        l.isShared(),
        l.getDepartment(),
        l.getConvertedAccountId(),
        l.getConvertedOpportunityId(),
        l.getConvertedAt(),
        l.getLastInteractedAt(),
        l.getCreatedBy(),
        l.getUpdatedBy(),
        l.getCreatedAt(),
        l.getUpdatedAt(),
        l.isDeleted(),
        l.getDeletedAt(),
        l.getDeletedBy());
  }
}

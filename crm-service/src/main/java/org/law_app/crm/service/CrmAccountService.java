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
import static org.law_app.crm.service.CrmSupport.parseTrailingNumber;
import static org.law_app.crm.service.CrmSupport.removeTagFromJsonList;
import static org.law_app.crm.service.CrmSupport.startOfDayInstant;
import static org.law_app.crm.service.CrmSupport.toJsonList;
import static org.law_app.crm.service.CrmSupport.trimOrNull;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmAccountContact;
import org.law_app.crm.repository.CrmAccountContactRepository;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountContactCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountKpisDto;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountContactDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountOverviewDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmAccountService {

  private final CrmAccountRepository accountRepo;
  private final CrmAccountContactRepository contactRepo;
  private final CrmOpportunityService opportunityService;
  private final CrmContractService contractService;

  @Transactional(readOnly = true)
  public Page<CrmAccountDto> search(
      String me,
      String keyword,
      String customerStatus,
      String careStatus,
      String assignedTo,
      String serviceGroup,
      String billingProvince,
      LocalDate from,
      LocalDate to,
      Pageable pageable) {
    return search(
        me,
        keyword,
        customerStatus,
        careStatus,
        assignedTo,
        serviceGroup,
        billingProvince,
        from,
        to,
        null,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmAccountDto> search(
      String me,
      String keyword,
      String customerStatus,
      String careStatus,
      String assignedTo,
      String serviceGroup,
      String billingProvince,
      LocalDate from,
      LocalDate to,
      String filters,
      Pageable pageable) {
    return search(
        me,
        keyword,
        customerStatus,
        careStatus,
        assignedTo,
        serviceGroup,
        billingProvince,
        from,
        to,
        filters,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmAccountDto> search(
      String me,
      String keyword,
      String customerStatus,
      String careStatus,
      String assignedTo,
      String serviceGroup,
      String billingProvince,
      LocalDate from,
      LocalDate to,
      String filters,
      boolean trashed,
      Pageable pageable) {

    List<CrmDynamicFilterSpec.FilterRule> filterRules = CrmDynamicFilterSpec.parseRules(filters);

    Specification<CrmAccount> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();
          ps.add(trashed ? cb.isTrue(root.get("deleted")) : cb.isFalse(root.get("deleted")));
          if (hasText(keyword)) {
            String like = "%" + keyword.trim().toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("customerName")), like),
                    cb.like(cb.lower(root.get("phone")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("taxCode")), like),
                    cb.like(cb.lower(root.get("contactName")), like),
                    cb.like(cb.lower(root.get("contactPhone")), like)));
          }
          if (hasText(customerStatus)) {
            ps.add(cb.equal(root.get("customerStatus"), customerStatus.trim()));
          }
          if (hasText(careStatus)) {
            ps.add(
                cb.like(
                    cb.lower(root.get("careStatuses")),
                    "%" + careStatus.trim().toLowerCase() + "%"));
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
          if (hasText(billingProvince)) {
            ps.add(
                cb.like(
                    cb.lower(root.get("billingProvince")),
                    "%" + billingProvince.trim().toLowerCase() + "%"));
          }
          if (from != null) {
            ps.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startOfDayInstant(from)));
          }
          if (to != null) {
            ps.add(cb.lessThan(root.get("createdAt"), endExclusiveInstant(to)));
          }
          ps.addAll(
              CrmDynamicFilterSpec.buildPredicates(
                  filterRules, CrmDynamicFilterSpec.ACCOUNT_FIELDS, root, cb));
          return cb.and(ps.toArray(new Predicate[0]));
        };

    return accountRepo.findAll(spec, pageable).map(this::toDto);
  }

  @Transactional(readOnly = true)
  public CrmAccountDto get(String id) {
    return toDto(requireAccount(id));
  }

  @Transactional(readOnly = true)
  public CrmAccountOverviewDto overview(String id) {
    CrmAccount account = requireAccount(id);
    List<CrmAccountContactDto> contacts =
        contactRepo.findByAccountIdOrderByPrimaryContactDescCreatedAtAsc(id).stream()
            .map(this::toContactDto)
            .toList();
    List<CrmOpportunityDto> opportunities = opportunityService.listByAccount(id);
    List<CrmContractDto> contracts = contractService.listByAccount(id);

    BigDecimal totalOrder = BigDecimal.ZERO;
    BigDecimal totalCollected = BigDecimal.ZERO;
    BigDecimal totalReceivable = BigDecimal.ZERO;
    for (CrmContractDto c : contracts) {
      totalOrder = totalOrder.add(money(c.orderValue()));
      totalCollected = totalCollected.add(money(c.collectedAmount()));
      totalReceivable = totalReceivable.add(money(c.receivableAmount()));
    }

    int purchaseCycleDays = computePurchaseCycleDays(account, contracts);
    AccountKpisDto kpis =
        new AccountKpisDto(
            contracts.size(),
            money(totalOrder),
            money(totalCollected),
            money(totalReceivable),
            opportunities.size(),
            purchaseCycleDays);

    return new CrmAccountOverviewDto(toDto(account), kpis, contacts, opportunities, contracts);
  }

  @Transactional
  public CrmAccountDto create(AccountUpsertRequest req) {
    Instant now = Instant.now();
    String actor = currentActorId();

    CrmAccount account = new CrmAccount();
    account.setId(newId());
    account.setCode(hasText(req.code()) ? req.code().trim() : nextAccountCode());
    account.setCreatedBy(actor);
    account.setUpdatedBy(actor);
    account.setCreatedAt(now);
    account.setUpdatedAt(now);

    applyFields(account, req);
    CrmAccount saved = accountRepo.save(account);

    if (hasText(saved.getContactName())) {
      contactRepo.save(
          CrmAccountContact.builder()
              .id(newId())
              .accountId(saved.getId())
              .fullName(saved.getContactName())
              .jobTitle(saved.getContactTitle())
              .phone(hasText(saved.getContactPhone()) ? saved.getContactPhone() : saved.getPhone())
              .email(hasText(saved.getContactEmail()) ? saved.getContactEmail() : saved.getEmail())
              .birthDate(saved.getContactBirthDate())
              .primaryContact(true)
              .createdAt(now)
              .build());
    }
    return toDto(saved);
  }

  @Transactional
  public CrmAccountDto update(String id, AccountUpsertRequest req) {
    CrmAccount account = requireAccount(id);
    if (hasText(req.code())) {
      account.setCode(req.code().trim());
    }
    account.setUpdatedBy(currentActorId());
    account.setUpdatedAt(Instant.now());

    applyFields(account, req);
    return toDto(accountRepo.save(account));
  }

  @Transactional
  public void delete(String id) {
    CrmAccount account = requireAccount(id);
    Instant now = Instant.now();
    account.setDeleted(true);
    account.setDeletedAt(now);
    account.setDeletedBy(currentActorName());
    account.setUpdatedAt(now);
    account.setUpdatedBy(currentActorId());
    accountRepo.save(account);
  }

  @Transactional
  public CrmAccountDto restore(String id) {
    CrmAccount account = requireAccount(id);
    account.setDeleted(false);
    account.setDeletedAt(null);
    account.setDeletedBy(null);
    account.setUpdatedAt(Instant.now());
    account.setUpdatedBy(currentActorId());
    return toDto(accountRepo.save(account));
  }

  @Transactional
  public void permanentDelete(String id) {
    CrmAccount account = requireAccount(id);
    contactRepo.deleteByAccountId(id);
    accountRepo.delete(account);
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

    List<CrmAccount> rows = accountRepo.findAllById(ids);
    Instant now = Instant.now();
    String actorId = currentActorId();
    String actorName = currentActorName();
    int affected = 0;

    for (CrmAccount account : rows) {
      switch (action) {
        case "ASSIGN" -> {
          account.setAssignedUserId(trimOrNull(req.assignedUserId()));
          account.setAssignedUserName(trimOrNull(req.assignedUserName()));
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "SHARE" -> {
          account.setShared(req.shared() != null ? req.shared() : true);
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "UNSHARE" -> {
          account.setShared(false);
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "ADD_TAG" -> {
          account.setTags(addTagToJsonList(account.getTags(), req.tag()));
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "REMOVE_TAG" -> {
          account.setTags(removeTagFromJsonList(account.getTags(), req.tag()));
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "DELETE" -> {
          account.setDeleted(true);
          account.setDeletedAt(now);
          account.setDeletedBy(actorName);
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "RESTORE" -> {
          account.setDeleted(false);
          account.setDeletedAt(null);
          account.setDeletedBy(null);
          account.setUpdatedAt(now);
          account.setUpdatedBy(actorId);
          accountRepo.save(account);
          affected++;
        }
        case "PERMANENT_DELETE" -> {
          contactRepo.deleteByAccountId(account.getId());
          accountRepo.delete(account);
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
  public CrmAccountContactDto addContact(String accountId, AccountContactCreateRequest req) {
    CrmAccount account = requireAccount(accountId);
    List<CrmAccountContact> existing =
        contactRepo.findByAccountIdOrderByPrimaryContactDescCreatedAtAsc(accountId);
    boolean primary = req.primaryContact() != null ? req.primaryContact() : existing.isEmpty();

    if (primary && !existing.isEmpty()) {
      for (CrmAccountContact c : existing) {
        if (c.isPrimaryContact()) {
          c.setPrimaryContact(false);
          contactRepo.save(c);
        }
      }
    }

    CrmAccountContact contact =
        CrmAccountContact.builder()
            .id(newId())
            .accountId(accountId)
            .fullName(blankToDefault(req.fullName(), "Người liên hệ"))
            .jobTitle(trimOrNull(req.jobTitle()))
            .phone(trimOrNull(req.phone()))
            .email(trimOrNull(req.email()))
            .birthDate(req.birthDate())
            .primaryContact(primary)
            .createdAt(Instant.now())
            .build();

    CrmAccountContact saved = contactRepo.save(contact);
    if (primary) {
      account.setContactName(saved.getFullName());
      account.setContactTitle(saved.getJobTitle());
      account.setContactPhone(saved.getPhone());
      account.setContactEmail(saved.getEmail());
      account.setContactBirthDate(saved.getBirthDate());
      account.setUpdatedAt(Instant.now());
      account.setUpdatedBy(currentActorId());
      accountRepo.save(account);
    }
    return toContactDto(saved);
  }

  @Transactional
  public void deleteContact(String accountId, String contactId) {
    requireAccount(accountId);
    CrmAccountContact contact =
        contactRepo
            .findById(contactId)
            .filter(c -> accountId.equals(c.getAccountId()))
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));
    contactRepo.delete(contact);
  }

  @Transactional
  public int importAccounts(List<AccountUpsertRequest> items) {
    if (items == null || items.isEmpty()) {
      return 0;
    }
    for (AccountUpsertRequest item : items) {
      create(item);
    }
    return items.size();
  }

  public CrmAccount requireAccount(String id) {
    return accountRepo
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
  }

  private void applyFields(CrmAccount acc, AccountUpsertRequest req) {
    if (hasText(req.sourceLeadId())) {
      acc.setSourceLeadId(req.sourceLeadId().trim());
    }
    acc.setTags(toJsonList(req.tags()));
    acc.setCustomerName(blankToDefault(req.customerName(), "Khách hàng mới"));
    acc.setPhone(trimOrNull(req.phone()));
    acc.setCareStatuses(toJsonList(req.careStatuses()));
    acc.setCustomerStatus(blankToDefault(req.customerStatus(), "Tiềm năng"));
    acc.setLostReason(trimOrNull(req.lostReason()));
    acc.setLeadSource(trimOrNull(req.leadSource()));
    acc.setAssignedUserId(trimOrNull(req.assignedUserId()));
    acc.setAssignedUserName(trimOrNull(req.assignedUserName()));
    acc.setOwnerUserId(
        hasText(req.ownerUserId())
            ? req.ownerUserId().trim()
            : (hasText(req.assignedUserId()) ? req.assignedUserId().trim() : acc.getOwnerUserId()));
    acc.setOwnerUserName(
        hasText(req.ownerUserName())
            ? req.ownerUserName().trim()
            : (hasText(req.assignedUserName())
                ? req.assignedUserName().trim()
                : acc.getOwnerUserName()));
    acc.setRelatedUsers(trimOrNull(req.relatedUsers()));
    acc.setServiceGroups(toJsonList(req.serviceGroups()));
    acc.setServicesSummary(
        hasText(req.servicesSummary())
            ? req.servicesSummary().trim()
            : (req.serviceGroups() != null && !req.serviceGroups().isEmpty()
                ? String.join(", ", req.serviceGroups())
                : acc.getServicesSummary()));
    acc.setTaxCode(trimOrNull(req.taxCode()));
    acc.setIndustries(toJsonList(req.industries()));
    acc.setEmail(trimOrNull(req.email()));
    acc.setRankLabel(blankToDefault(req.rankLabel(), "Chưa xếp hạng"));
    acc.setContactName(trimOrNull(req.contactName()));
    acc.setContactTitle(trimOrNull(req.contactTitle()));
    acc.setContactPhone(trimOrNull(req.contactPhone()));
    acc.setContactEmail(trimOrNull(req.contactEmail()));
    acc.setContactBirthDate(req.contactBirthDate());
    acc.setDemandDetail(trimOrNull(req.demandDetail()));
    acc.setBillingProvince(trimOrNull(req.billingProvince()));
    acc.setBillingDistrict(trimOrNull(req.billingDistrict()));
    acc.setBillingAddress(trimOrNull(req.billingAddress()));
    acc.setCompanySize(trimOrNull(req.companySize()));
    acc.setFoundedDate(req.foundedDate());
    acc.setPaymentTermType(blankToDefault(req.paymentTermType(), "Không xác định"));
    acc.setWebsite(trimOrNull(req.website()));
    acc.setAnnualRevenue(req.annualRevenue() != null ? money(req.annualRevenue()) : null);
    if (req.shared() != null) {
      acc.setShared(req.shared());
    }
    if (req.individual() != null) {
      acc.setIndividual(req.individual());
    }
    if (req.partner() != null) {
      acc.setPartner(req.partner());
    }
    acc.setReferrer(trimOrNull(req.referrer()));
  }

  private int computePurchaseCycleDays(CrmAccount account, List<CrmContractDto> contracts) {
    List<LocalDate> dates =
        contracts.stream()
            .map(c -> c.bookingDate() != null ? c.bookingDate() : c.orderDate())
            .filter(Objects::nonNull)
            .sorted(Comparator.naturalOrder())
            .toList();
    if (dates.size() >= 2) {
      long span = ChronoUnit.DAYS.between(dates.get(0), dates.get(dates.size() - 1));
      return (int) Math.max(0L, span / (dates.size() - 1));
    }
    if (dates.size() == 1 && account.getCreatedAt() != null) {
      LocalDate createdDate = account.getCreatedAt().atZone(VN_ZONE).toLocalDate();
      return (int) Math.max(0L, ChronoUnit.DAYS.between(createdDate, dates.get(0)));
    }
    return 0;
  }

  private String nextAccountCode() {
    int max =
        accountRepo
            .findTopByCodeStartingWithOrderByCodeDesc("KH26")
            .map(a -> parseTrailingNumber(a.getCode(), "KH26"))
            .orElse(0);
    int seq = max + 1;
    String candidate = String.format("KH26%04d", seq);
    while (accountRepo.existsByCode(candidate)) {
      seq++;
      candidate = String.format("KH26%04d", seq);
    }
    return candidate;
  }

  private CrmAccountDto toDto(CrmAccount a) {
    return new CrmAccountDto(
        a.getId(),
        a.getCode(),
        a.getSourceLeadId(),
        fromJsonList(a.getTags()),
        a.getCustomerName(),
        a.getPhone(),
        fromJsonList(a.getCareStatuses()),
        a.getCustomerStatus(),
        a.getLostReason(),
        a.getLeadSource(),
        a.getAssignedUserId(),
        a.getAssignedUserName(),
        a.getOwnerUserId(),
        a.getOwnerUserName(),
        a.getRelatedUsers(),
        fromJsonList(a.getServiceGroups()),
        a.getServicesSummary(),
        a.getTaxCode(),
        fromJsonList(a.getIndustries()),
        a.getEmail(),
        a.getRankLabel(),
        a.getContactName(),
        a.getContactTitle(),
        a.getContactPhone(),
        a.getContactEmail(),
        a.getContactBirthDate(),
        a.getDemandDetail(),
        a.getBillingProvince(),
        a.getBillingDistrict(),
        a.getBillingAddress(),
        a.getCompanySize(),
        a.getFoundedDate(),
        a.getPaymentTermType(),
        a.getWebsite(),
        a.getAnnualRevenue() != null ? money(a.getAnnualRevenue()) : null,
        a.isShared(),
        a.isIndividual(),
        a.isPartner(),
        a.getReferrer(),
        a.getCreatedBy(),
        a.getUpdatedBy(),
        a.getCreatedAt(),
        a.getUpdatedAt(),
        a.isDeleted(),
        a.getDeletedAt(),
        a.getDeletedBy());
  }

  private CrmAccountContactDto toContactDto(CrmAccountContact c) {
    return new CrmAccountContactDto(
        c.getId(),
        c.getAccountId(),
        c.getFullName(),
        c.getJobTitle(),
        c.getPhone(),
        c.getEmail(),
        c.getBirthDate(),
        c.isPrimaryContact(),
        c.getCreatedAt());
  }
}

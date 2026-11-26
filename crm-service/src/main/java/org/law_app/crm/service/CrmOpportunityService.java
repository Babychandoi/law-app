package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.VN_ZONE;
import static org.law_app.crm.service.CrmSupport.addTagToJsonList;
import static org.law_app.crm.service.CrmSupport.assignedPredicate;
import static org.law_app.crm.service.CrmSupport.blankToDefault;
import static org.law_app.crm.service.CrmSupport.computeLineItem;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmOpportunity;
import org.law_app.crm.domain.CrmOpportunityItem;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmOpportunityItemRepository;
import org.law_app.crm.repository.CrmOpportunityRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmKanbanColumnDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityUpsertRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmOpportunityService {

  public static final List<String> CANONICAL_STAGES =
      List.of(
          "1/ Liên hệ tư vấn & báo phí",
          "2/ Gửi yêu cầu về hồ sơ",
          "3/ Đã chăm sóc lại",
          "4/ Rà soát, đánh giá hồ sơ",
          "5/ KH đủ điều kiện hồ sơ",
          "6/ Gửi HĐ dự thảo cho KH",
          "7/ KH thanh toán lần 1");

  private final CrmOpportunityRepository opportunityRepo;
  private final CrmOpportunityItemRepository itemRepo;
  private final CrmAccountRepository accountRepo;
  private final CrmContractService contractService;

  @Transactional(readOnly = true)
  public Page<CrmOpportunityDto> search(
      String me,
      String keyword,
      String stage,
      String assignedTo,
      String serviceGroup,
      String accountId,
      LocalDate from,
      LocalDate to,
      Pageable pageable) {
    return search(
        me, keyword, stage, assignedTo, serviceGroup, accountId, from, to, null, false, pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmOpportunityDto> search(
      String me,
      String keyword,
      String stage,
      String assignedTo,
      String serviceGroup,
      String accountId,
      LocalDate from,
      LocalDate to,
      String filters,
      Pageable pageable) {
    return search(
        me,
        keyword,
        stage,
        assignedTo,
        serviceGroup,
        accountId,
        from,
        to,
        filters,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public Page<CrmOpportunityDto> search(
      String me,
      String keyword,
      String stage,
      String assignedTo,
      String serviceGroup,
      String accountId,
      LocalDate from,
      LocalDate to,
      String filters,
      boolean trashed,
      Pageable pageable) {

    Specification<CrmOpportunity> spec =
        buildSpec(
            me, keyword, stage, assignedTo, serviceGroup, accountId, from, to, filters, trashed);
    Page<CrmOpportunity> page = opportunityRepo.findAll(spec, pageable);
    if (page.isEmpty()) {
      return page.map(o -> toDto(o, List.of()));
    }
    Map<String, List<CrmOpportunityItem>> itemsMap = loadItemsMap(page.getContent());
    return page.map(o -> toDto(o, itemsMap.getOrDefault(o.getId(), List.of())));
  }

  @Transactional(readOnly = true)
  public List<CrmKanbanColumnDto> kanban(
      String me, String keyword, String assignedTo, String serviceGroup) {
    return kanban(me, keyword, assignedTo, serviceGroup, null, false);
  }

  @Transactional(readOnly = true)
  public List<CrmKanbanColumnDto> kanban(
      String me, String keyword, String assignedTo, String serviceGroup, String filters) {
    return kanban(me, keyword, assignedTo, serviceGroup, filters, false);
  }

  @Transactional(readOnly = true)
  public List<CrmKanbanColumnDto> kanban(
      String me,
      String keyword,
      String assignedTo,
      String serviceGroup,
      String filters,
      boolean trashed) {
    Specification<CrmOpportunity> spec =
        buildSpec(me, keyword, null, assignedTo, serviceGroup, null, null, null, filters, trashed);
    List<CrmOpportunity> rows =
        opportunityRepo.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    Map<String, List<CrmOpportunityItem>> itemsMap = loadItemsMap(rows);

    Map<String, List<CrmOpportunityDto>> grouped = new LinkedHashMap<>();
    for (String st : CANONICAL_STAGES) {
      grouped.put(st, new ArrayList<>());
    }
    for (CrmOpportunity row : rows) {
      CrmOpportunityDto dto = toDto(row, itemsMap.getOrDefault(row.getId(), List.of()));
      String st = hasText(row.getStage()) ? row.getStage().trim() : CANONICAL_STAGES.get(0);
      grouped.computeIfAbsent(st, k -> new ArrayList<>()).add(dto);
    }

    List<CrmKanbanColumnDto> columns = new ArrayList<>();
    for (Map.Entry<String, List<CrmOpportunityDto>> entry : grouped.entrySet()) {
      List<CrmOpportunityDto> cards = entry.getValue();
      BigDecimal sum =
          cards.stream()
              .map(c -> money(c.expectedRevenue()))
              .reduce(BigDecimal.ZERO, BigDecimal::add);
      columns.add(new CrmKanbanColumnDto(entry.getKey(), cards.size(), money(sum), cards));
    }
    return columns;
  }

  @Transactional(readOnly = true)
  public CrmOpportunityDto get(String id) {
    CrmOpportunity opp = requireOpportunity(id);
    List<CrmOpportunityItem> items = itemRepo.findByOpportunityIdOrderBySortOrderAsc(id);
    return toDto(opp, items);
  }

  @Transactional(readOnly = true)
  public List<CrmOpportunityDto> listByAccount(String accountId) {
    List<CrmOpportunity> opps =
        opportunityRepo.findByAccountIdOrderByCreatedAtDesc(accountId).stream()
            .filter(o -> !o.isDeleted())
            .toList();
    Map<String, List<CrmOpportunityItem>> itemsMap = loadItemsMap(opps);
    return opps.stream().map(o -> toDto(o, itemsMap.getOrDefault(o.getId(), List.of()))).toList();
  }

  @Transactional
  public CrmOpportunityDto create(OpportunityUpsertRequest req) {
    Instant now = Instant.now();
    String actor = currentActorId();

    CrmOpportunity opp = new CrmOpportunity();
    opp.setId(newId());
    opp.setCode(hasText(req.code()) ? req.code().trim() : nextOpportunityCode());
    opp.setCreatedBy(actor);
    opp.setUpdatedBy(actor);
    opp.setCreatedAt(now);
    opp.setUpdatedAt(now);

    applyFields(opp, req);
    List<CrmOpportunityItem> savedItems = replaceItems(opp, req.items(), req.expectedRevenue());
    CrmOpportunity saved = opportunityRepo.save(opp);
    return toDto(saved, savedItems);
  }

  @Transactional
  public CrmOpportunityDto update(String id, OpportunityUpsertRequest req) {
    CrmOpportunity opp = requireOpportunity(id);
    if (hasText(req.code())) {
      opp.setCode(req.code().trim());
    }
    opp.setUpdatedBy(currentActorId());
    opp.setUpdatedAt(Instant.now());

    applyFields(opp, req);
    List<CrmOpportunityItem> items =
        req.items() != null
            ? replaceItems(opp, req.items(), req.expectedRevenue())
            : itemRepo.findByOpportunityIdOrderBySortOrderAsc(id);
    CrmOpportunity saved = opportunityRepo.save(opp);
    return toDto(saved, items);
  }

  @Transactional
  public CrmOpportunityDto updateStage(String id, String stage) {
    CrmOpportunity opp = requireOpportunity(id);
    opp.setStage(blankToDefault(stage, CANONICAL_STAGES.get(0)));
    opp.setUpdatedBy(currentActorId());
    opp.setUpdatedAt(Instant.now());
    CrmOpportunity saved = opportunityRepo.save(opp);
    List<CrmOpportunityItem> items = itemRepo.findByOpportunityIdOrderBySortOrderAsc(id);
    return toDto(saved, items);
  }

  @Transactional
  public void delete(String id) {
    CrmOpportunity opp = requireOpportunity(id);
    Instant now = Instant.now();
    opp.setDeleted(true);
    opp.setDeletedAt(now);
    opp.setDeletedBy(currentActorName());
    opp.setUpdatedAt(now);
    opp.setUpdatedBy(currentActorId());
    opportunityRepo.save(opp);
  }

  @Transactional
  public CrmOpportunityDto restore(String id) {
    CrmOpportunity opp = requireOpportunity(id);
    opp.setDeleted(false);
    opp.setDeletedAt(null);
    opp.setDeletedBy(null);
    opp.setUpdatedAt(Instant.now());
    opp.setUpdatedBy(currentActorId());
    CrmOpportunity saved = opportunityRepo.save(opp);
    List<CrmOpportunityItem> items = itemRepo.findByOpportunityIdOrderBySortOrderAsc(id);
    return toDto(saved, items);
  }

  @Transactional
  public void permanentDelete(String id) {
    CrmOpportunity opp = requireOpportunity(id);
    itemRepo.deleteByOpportunityId(id);
    opportunityRepo.delete(opp);
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

    List<CrmOpportunity> rows = opportunityRepo.findAllById(ids);
    Instant now = Instant.now();
    String actorId = currentActorId();
    String actorName = currentActorName();
    int affected = 0;

    for (CrmOpportunity opp : rows) {
      switch (action) {
        case "ASSIGN" -> {
          opp.setAssignedUserId(trimOrNull(req.assignedUserId()));
          opp.setAssignedUserName(trimOrNull(req.assignedUserName()));
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "SHARE" -> {
          opp.setShared(req.shared() != null ? req.shared() : true);
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "UNSHARE" -> {
          opp.setShared(false);
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "ADD_TAG" -> {
          opp.setTags(addTagToJsonList(opp.getTags(), req.tag()));
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "REMOVE_TAG" -> {
          opp.setTags(removeTagFromJsonList(opp.getTags(), req.tag()));
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "DELETE" -> {
          opp.setDeleted(true);
          opp.setDeletedAt(now);
          opp.setDeletedBy(actorName);
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "RESTORE" -> {
          opp.setDeleted(false);
          opp.setDeletedAt(null);
          opp.setDeletedBy(null);
          opp.setUpdatedAt(now);
          opp.setUpdatedBy(actorId);
          opportunityRepo.save(opp);
          affected++;
        }
        case "PERMANENT_DELETE" -> {
          itemRepo.deleteByOpportunityId(opp.getId());
          opportunityRepo.delete(opp);
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
  public CrmContractDto convertToContract(String id) {
    CrmOpportunity opp = requireOpportunity(id);
    List<CrmOpportunityItem> oppItems = itemRepo.findByOpportunityIdOrderBySortOrderAsc(id);
    List<CrmLineItemDto> lineItems = oppItems.stream().map(this::toItemDto).toList();

    CrmAccount account =
        hasText(opp.getAccountId()) ? accountRepo.findById(opp.getAccountId()).orElse(null) : null;

    LocalDate today = LocalDate.now(VN_ZONE);
    ContractUpsertRequest contractReq =
        new ContractUpsertRequest(
            null,
            opp.getAccountId(),
            account != null ? account.getCode() : null,
            hasText(opp.getAccountName())
                ? opp.getAccountName()
                : (account != null ? account.getCustomerName() : null),
            opp.getContactName(),
            opp.getId(),
            null,
            null,
            today,
            null,
            null,
            null,
            today,
            null,
            "Bản nháp",
            "Chưa thực hiện",
            "Chưa có",
            opp.getLeadSource(),
            "Chuyển đổi từ Cơ hội",
            account != null ? account.getPaymentTermType() : null,
            opp.getAssignedUserId(),
            opp.getAssignedUserName(),
            null,
            null,
            BigDecimal.ZERO,
            money(opp.getExpectedRevenue()),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            null,
            null,
            account != null ? account.getCustomerName() : opp.getAccountName(),
            opp.getContactName(),
            "Việt Nam",
            account != null ? account.getBillingProvince() : null,
            account != null ? account.getBillingDistrict() : null,
            account != null ? account.getBillingAddress() : null,
            account != null ? account.getTaxCode() : null,
            opp.isShared(),
            opp.getReferrer(),
            false,
            false,
            opp.getNotes(),
            lineItems,
            fromJsonList(opp.getTags()));

    CrmContractDto createdContract = contractService.create(contractReq);
    opp.setConvertedContractId(createdContract.id());
    opp.setUpdatedBy(currentActorId());
    opp.setUpdatedAt(Instant.now());
    opportunityRepo.save(opp);

    return createdContract;
  }

  @Transactional
  public int importOpportunities(List<OpportunityUpsertRequest> items) {
    if (items == null || items.isEmpty()) {
      return 0;
    }
    for (OpportunityUpsertRequest item : items) {
      create(item);
    }
    return items.size();
  }

  public CrmOpportunity requireOpportunity(String id) {
    return opportunityRepo
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));
  }

  private Specification<CrmOpportunity> buildSpec(
      String me,
      String keyword,
      String stage,
      String assignedTo,
      String serviceGroup,
      String accountId,
      LocalDate from,
      LocalDate to,
      String filters,
      boolean trashed) {
    List<CrmDynamicFilterSpec.FilterRule> filterRules = CrmDynamicFilterSpec.parseRules(filters);
    return (root, query, cb) -> {
      List<Predicate> ps = new ArrayList<>();
      ps.add(trashed ? cb.isTrue(root.get("deleted")) : cb.isFalse(root.get("deleted")));
      if (hasText(keyword)) {
        String like = "%" + keyword.trim().toLowerCase() + "%";
        ps.add(
            cb.or(
                cb.like(cb.lower(root.get("code")), like),
                cb.like(cb.lower(root.get("opportunityName")), like),
                cb.like(cb.lower(root.get("accountName")), like),
                cb.like(cb.lower(root.get("contactName")), like),
                cb.like(cb.lower(root.get("contactPhone")), like)));
      }
      if (hasText(stage)) {
        ps.add(cb.equal(root.get("stage"), stage.trim()));
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
      if (hasText(accountId)) {
        ps.add(cb.equal(root.get("accountId"), accountId.trim()));
      }
      if (from != null) {
        ps.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startOfDayInstant(from)));
      }
      if (to != null) {
        ps.add(cb.lessThan(root.get("createdAt"), endExclusiveInstant(to)));
      }
      ps.addAll(
          CrmDynamicFilterSpec.buildPredicates(
              filterRules, CrmDynamicFilterSpec.OPPORTUNITY_FIELDS, root, cb));
      return cb.and(ps.toArray(new Predicate[0]));
    };
  }

  private void applyFields(CrmOpportunity opp, OpportunityUpsertRequest req) {
    opp.setTags(toJsonList(req.tags()));
    opp.setOpportunityName(blankToDefault(req.opportunityName(), "Cơ hội mới"));
    opp.setAccountId(trimOrNull(req.accountId()));
    String accName = trimOrNull(req.accountName());
    if (hasText(opp.getAccountId()) && !hasText(accName)) {
      CrmAccount acc = accountRepo.findById(opp.getAccountId()).orElse(null);
      if (acc != null) {
        accName = acc.getCustomerName();
      }
    }
    opp.setAccountName(accName);
    opp.setContactName(trimOrNull(req.contactName()));
    opp.setContactPhone(trimOrNull(req.contactPhone()));
    opp.setExpectedRevenue(money(req.expectedRevenue()));
    opp.setStage(blankToDefault(req.stage(), CANONICAL_STAGES.get(0)));
    opp.setExpectedCloseDate(req.expectedCloseDate());
    opp.setOpportunityTypes(toJsonList(req.opportunityTypes()));
    opp.setServiceGroups(toJsonList(req.serviceGroups()));
    opp.setLeadSource(trimOrNull(req.leadSource()));
    opp.setAssignedUserId(trimOrNull(req.assignedUserId()));
    opp.setAssignedUserName(trimOrNull(req.assignedUserName()));
    if (req.shared() != null) {
      opp.setShared(req.shared());
    }
    opp.setReferrer(trimOrNull(req.referrer()));
    opp.setNotes(trimOrNull(req.notes()));
    if (hasText(req.convertedContractId())) {
      opp.setConvertedContractId(req.convertedContractId().trim());
    }
  }

  private List<CrmOpportunityItem> replaceItems(
      CrmOpportunity opp, List<CrmLineItemDto> rawItems, BigDecimal explicitExpectedRevenue) {
    itemRepo.deleteByOpportunityId(opp.getId());
    if (rawItems == null || rawItems.isEmpty()) {
      return List.of();
    }
    List<CrmOpportunityItem> entities = new ArrayList<>(rawItems.size());
    BigDecimal sumTotal = BigDecimal.ZERO;
    for (int i = 0; i < rawItems.size(); i++) {
      CrmLineItemDto computed = computeLineItem(rawItems.get(i), i);
      sumTotal = sumTotal.add(computed.totalAmount());
      entities.add(
          CrmOpportunityItem.builder()
              .id(newId())
              .opportunityId(opp.getId())
              .sortOrder(computed.sortOrder())
              .itemCode(computed.itemCode())
              .description(computed.description())
              .warehouse(computed.warehouse())
              .unit(computed.unit())
              .quantity(computed.quantity())
              .deliveredQuantity(computed.deliveredQuantity())
              .unitPrice(computed.unitPrice())
              .amount(computed.amount())
              .tradeDiscount(computed.tradeDiscount())
              .discountRate(computed.discountRate())
              .discountAmount(computed.discountAmount())
              .vatRate(computed.vatRate())
              .vatAmount(computed.vatAmount())
              .totalAmount(computed.totalAmount())
              .parentContractNumber(computed.parentContractNumber())
              .promotionCode(computed.promotionCode())
              .freeItem(computed.freeItem())
              .build());
    }
    List<CrmOpportunityItem> saved = itemRepo.saveAll(entities);
    if (saved == null || saved.isEmpty()) {
      saved = entities;
    }
    if (explicitExpectedRevenue == null
        || explicitExpectedRevenue.compareTo(BigDecimal.ZERO) <= 0) {
      opp.setExpectedRevenue(money(sumTotal));
    }
    return saved;
  }

  private String nextOpportunityCode() {
    int max =
        opportunityRepo
            .findTopByCodeStartingWithOrderByCodeDesc("CH26")
            .map(o -> parseTrailingNumber(o.getCode(), "CH26"))
            .orElse(0);
    int seq = max + 1;
    String candidate = String.format("CH26%04d", seq);
    while (opportunityRepo.existsByCode(candidate)) {
      seq++;
      candidate = String.format("CH26%04d", seq);
    }
    return candidate;
  }

  private Map<String, List<CrmOpportunityItem>> loadItemsMap(List<CrmOpportunity> opps) {
    if (opps == null || opps.isEmpty()) {
      return Map.of();
    }
    List<String> ids = opps.stream().map(CrmOpportunity::getId).toList();
    List<CrmOpportunityItem> items = itemRepo.findByOpportunityIdInOrderBySortOrderAsc(ids);
    return (items == null ? List.<CrmOpportunityItem>of() : items)
        .stream().collect(Collectors.groupingBy(CrmOpportunityItem::getOpportunityId));
  }

  private CrmOpportunityDto toDto(CrmOpportunity o, List<CrmOpportunityItem> items) {
    List<CrmLineItemDto> lineDtos =
        (items == null ? List.<CrmOpportunityItem>of() : items)
            .stream().map(this::toItemDto).toList();
    return new CrmOpportunityDto(
        o.getId(),
        o.getCode(),
        fromJsonList(o.getTags()),
        o.getOpportunityName(),
        o.getAccountId(),
        o.getAccountName(),
        o.getContactName(),
        o.getContactPhone(),
        money(o.getExpectedRevenue()),
        o.getStage(),
        o.getExpectedCloseDate(),
        fromJsonList(o.getOpportunityTypes()),
        fromJsonList(o.getServiceGroups()),
        o.getLeadSource(),
        o.getAssignedUserId(),
        o.getAssignedUserName(),
        o.isShared(),
        o.getReferrer(),
        o.getNotes(),
        o.getConvertedContractId(),
        lineDtos,
        o.getCreatedBy(),
        o.getUpdatedBy(),
        o.getCreatedAt(),
        o.getUpdatedAt(),
        o.isDeleted(),
        o.getDeletedAt(),
        o.getDeletedBy());
  }

  private CrmLineItemDto toItemDto(CrmOpportunityItem i) {
    return new CrmLineItemDto(
        i.getId(),
        i.getSortOrder(),
        i.getItemCode(),
        i.getDescription(),
        i.getWarehouse(),
        i.getUnit(),
        money(i.getQuantity()),
        money(i.getDeliveredQuantity()),
        money(i.getUnitPrice()),
        money(i.getAmount()),
        money(i.getTradeDiscount()),
        money(i.getDiscountRate()),
        money(i.getDiscountAmount()),
        i.getVatRate(),
        money(i.getVatAmount()),
        money(i.getTotalAmount()),
        i.getParentContractNumber(),
        i.getPromotionCode(),
        i.isFreeItem());
  }
}

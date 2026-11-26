package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.VN_ZONE;
import static org.law_app.crm.service.CrmSupport.addTagToJsonList;
import static org.law_app.crm.service.CrmSupport.assignedPredicate;
import static org.law_app.crm.service.CrmSupport.blankToDefault;
import static org.law_app.crm.service.CrmSupport.computeLineItem;
import static org.law_app.crm.service.CrmSupport.currentActorId;
import static org.law_app.crm.service.CrmSupport.currentActorName;
import static org.law_app.crm.service.CrmSupport.fromJsonList;
import static org.law_app.crm.service.CrmSupport.hasText;
import static org.law_app.crm.service.CrmSupport.money;
import static org.law_app.crm.service.CrmSupport.newId;
import static org.law_app.crm.service.CrmSupport.parseTrailingNumber;
import static org.law_app.crm.service.CrmSupport.removeTagFromJsonList;
import static org.law_app.crm.service.CrmSupport.toJsonList;
import static org.law_app.crm.service.CrmSupport.trimOrNull;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CrmAccount;
import org.law_app.crm.domain.CrmContract;
import org.law_app.crm.domain.CrmContractCashflow;
import org.law_app.crm.domain.CrmContractItem;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmContractCashflowRepository;
import org.law_app.crm.repository.CrmContractItemRepository;
import org.law_app.crm.repository.CrmContractRepository;
import org.law_app.crm.web.EnterpriseCrmDtos.BulkActionRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CashflowCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractCashflowDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractListPayload;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractSummaryDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CrmContractService {

  private final CrmContractRepository contractRepo;
  private final CrmContractItemRepository itemRepo;
  private final CrmContractCashflowRepository cashflowRepo;
  private final CrmAccountRepository accountRepo;

  public record ContractSearchResult(CrmContractListPayload payload, Page<CrmContract> page) {}

  @Transactional(readOnly = true)
  public ContractSearchResult search(
      String me,
      String keyword,
      String revenueStatus,
      String executionStatus,
      String assignedTo,
      String department,
      String accountId,
      LocalDate bookingFrom,
      LocalDate bookingTo,
      LocalDate paymentFrom,
      LocalDate paymentTo,
      String preset,
      Pageable pageable) {
    return search(
        me,
        keyword,
        revenueStatus,
        executionStatus,
        assignedTo,
        department,
        accountId,
        bookingFrom,
        bookingTo,
        paymentFrom,
        paymentTo,
        preset,
        null,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public ContractSearchResult search(
      String me,
      String keyword,
      String revenueStatus,
      String executionStatus,
      String assignedTo,
      String department,
      String accountId,
      LocalDate bookingFrom,
      LocalDate bookingTo,
      LocalDate paymentFrom,
      LocalDate paymentTo,
      String preset,
      String filters,
      Pageable pageable) {
    return search(
        me,
        keyword,
        revenueStatus,
        executionStatus,
        assignedTo,
        department,
        accountId,
        bookingFrom,
        bookingTo,
        paymentFrom,
        paymentTo,
        preset,
        filters,
        false,
        pageable);
  }

  @Transactional(readOnly = true)
  public ContractSearchResult search(
      String me,
      String keyword,
      String revenueStatus,
      String executionStatus,
      String assignedTo,
      String department,
      String accountId,
      LocalDate bookingFrom,
      LocalDate bookingTo,
      LocalDate paymentFrom,
      LocalDate paymentTo,
      String preset,
      String filters,
      boolean trashed,
      Pageable pageable) {

    List<CrmDynamicFilterSpec.FilterRule> filterRules = CrmDynamicFilterSpec.parseRules(filters);

    Specification<CrmContract> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();
          ps.add(trashed ? cb.isTrue(root.get("deleted")) : cb.isFalse(root.get("deleted")));
          if (hasText(keyword)) {
            String like = "%" + keyword.trim().toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("contractNumber")), like),
                    cb.like(cb.lower(root.get("accountCode")), like),
                    cb.like(cb.lower(root.get("accountName")), like),
                    cb.like(cb.lower(root.get("contactName")), like),
                    cb.like(cb.lower(root.get("goodsSummary")), like),
                    cb.like(cb.lower(root.get("taxCode")), like),
                    cb.like(cb.lower(root.get("externalOrderNumber")), like),
                    cb.like(cb.lower(root.get("invoiceLookupCode")), like)));
          }
          if (hasText(revenueStatus)) {
            ps.add(cb.equal(root.get("revenueStatus"), revenueStatus.trim()));
          }
          if (hasText(executionStatus)) {
            ps.add(cb.equal(root.get("executionStatus"), executionStatus.trim()));
          }
          Predicate assigned = assignedPredicate(cb, root, assignedTo, me);
          if (assigned != null) {
            ps.add(assigned);
          }
          if (hasText(department)) {
            ps.add(cb.equal(root.get("department"), department.trim()));
          }
          if (hasText(accountId)) {
            ps.add(cb.equal(root.get("accountId"), accountId.trim()));
          }
          if (bookingFrom != null) {
            ps.add(cb.greaterThanOrEqualTo(root.get("bookingDate"), bookingFrom));
          }
          if (bookingTo != null) {
            ps.add(cb.lessThanOrEqualTo(root.get("bookingDate"), bookingTo));
          }
          if (paymentFrom != null) {
            ps.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), paymentFrom));
          }
          if (paymentTo != null) {
            ps.add(cb.lessThanOrEqualTo(root.get("paymentDate"), paymentTo));
          }
          if (hasText(preset)) {
            LocalDate today = LocalDate.now(VN_ZONE);
            LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfWeek = startOfWeek.plusDays(6);
            LocalDate startOfMonth = today.withDayOfMonth(1);
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());
            switch (preset.trim().toUpperCase()) {
              case "BOOKING_THIS_WEEK" ->
                  ps.add(cb.between(root.get("bookingDate"), startOfWeek, endOfWeek));
              case "BOOKING_THIS_MONTH" ->
                  ps.add(cb.between(root.get("bookingDate"), startOfMonth, endOfMonth));
              case "ORDER_THIS_WEEK" ->
                  ps.add(cb.between(root.get("orderDate"), startOfWeek, endOfWeek));
              case "ORDER_THIS_MONTH" ->
                  ps.add(cb.between(root.get("orderDate"), startOfMonth, endOfMonth));
              case "PENDING_REVENUE" -> ps.add(cb.equal(root.get("revenueStatus"), "Đề nghị ghi"));
              case "UNPAID" ->
                  ps.add(cb.greaterThan(root.get("receivableAmount"), BigDecimal.ZERO));
              default -> {}
            }
          }
          ps.addAll(
              CrmDynamicFilterSpec.buildPredicates(
                  filterRules, CrmDynamicFilterSpec.CONTRACT_FIELDS, root, cb));
          return cb.and(ps.toArray(new Predicate[0]));
        };

    Page<CrmContract> pageResult = contractRepo.findAll(spec, pageable);
    List<CrmContract> allMatching = contractRepo.findAll(spec);

    List<CrmContractDto> rows = toDtos(pageResult.getContent());
    CrmContractSummaryDto summary = computeSummary(allMatching);
    return new ContractSearchResult(new CrmContractListPayload(rows, summary), pageResult);
  }

  public CrmContractSummaryDto computeSummary(List<CrmContract> contracts) {
    if (contracts == null || contracts.isEmpty()) {
      return new CrmContractSummaryDto(
          0L,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO);
    }
    BigDecimal totalOrder = BigDecimal.ZERO;
    BigDecimal totalCollected = BigDecimal.ZERO;
    BigDecimal totalReceivable = BigDecimal.ZERO;
    BigDecimal totalProfit = BigDecimal.ZERO;
    BigDecimal totalActualExpense = BigDecimal.ZERO;
    BigDecimal totalPlannedExpense = BigDecimal.ZERO;
    BigDecimal totalPayable = BigDecimal.ZERO;
    BigDecimal totalServiceExpense = BigDecimal.ZERO;
    BigDecimal totalStateFeeExpense = BigDecimal.ZERO;
    BigDecimal totalSupportExpense = BigDecimal.ZERO;
    BigDecimal totalLiquidationValue = BigDecimal.ZERO;
    BigDecimal totalUninvoicedAmount = BigDecimal.ZERO;

    for (CrmContract c : contracts) {
      totalOrder = totalOrder.add(money(c.getOrderValue()));
      totalCollected = totalCollected.add(money(c.getCollectedAmount()));
      totalReceivable = totalReceivable.add(money(c.getReceivableAmount()));
      totalProfit = totalProfit.add(money(c.getEstimatedProfit()));
      totalActualExpense = totalActualExpense.add(money(c.getActualExpense()));
      totalPlannedExpense = totalPlannedExpense.add(money(c.getPlannedExpense()));
      totalPayable = totalPayable.add(money(c.getPayableAmount()));
      totalServiceExpense = totalServiceExpense.add(money(c.getServiceExpense()));
      totalStateFeeExpense = totalStateFeeExpense.add(money(c.getStateFeeExpense()));
      totalSupportExpense = totalSupportExpense.add(money(c.getSupportExpense()));
      totalLiquidationValue = totalLiquidationValue.add(money(c.getLiquidationValue()));
      totalUninvoicedAmount = totalUninvoicedAmount.add(money(c.getUninvoicedAmount()));
    }
    return new CrmContractSummaryDto(
        contracts.size(),
        money(totalOrder),
        money(totalCollected),
        money(totalReceivable),
        money(totalProfit),
        money(totalActualExpense),
        money(totalPlannedExpense),
        money(totalPayable),
        money(totalServiceExpense),
        money(totalStateFeeExpense),
        money(totalSupportExpense),
        money(totalLiquidationValue),
        money(totalUninvoicedAmount));
  }

  @Transactional(readOnly = true)
  public CrmContractDto get(String id) {
    CrmContract contract = requireContract(id);
    List<CrmContractItem> items = itemRepo.findByContractIdOrderBySortOrderAsc(id);
    return toDto(contract, items);
  }

  @Transactional(readOnly = true)
  public List<CrmContractDto> listByAccount(String accountId) {
    List<CrmContract> contracts =
        contractRepo.findByAccountIdOrderByBookingDateDescCreatedAtDesc(accountId).stream()
            .filter(c -> !c.isDeleted())
            .toList();
    return toDtos(contracts);
  }

  @Transactional
  public CrmContractDto create(ContractUpsertRequest req) {
    Instant now = Instant.now();
    String actor = currentActorId();

    CrmContract contract = new CrmContract();
    contract.setId(newId());
    contract.setContractNumber(
        hasText(req.contractNumber()) ? req.contractNumber().trim() : nextContractNumber());
    contract.setCreatedBy(actor);
    contract.setUpdatedBy(actor);
    contract.setCreatedAt(now);
    contract.setUpdatedAt(now);

    applyFields(contract, req, true);
    List<CrmContractItem> savedItems = replaceItems(contract, req.items(), req);
    recalculateFinancials(contract, List.of());

    CrmContract saved = contractRepo.save(contract);
    return toDto(saved, savedItems);
  }

  @Transactional
  public CrmContractDto update(String id, ContractUpsertRequest req) {
    CrmContract contract = requireContract(id);
    if (hasText(req.contractNumber())) {
      contract.setContractNumber(req.contractNumber().trim());
    }
    contract.setUpdatedBy(currentActorId());
    contract.setUpdatedAt(Instant.now());

    applyFields(contract, req, false);
    List<CrmContractItem> items =
        req.items() != null
            ? replaceItems(contract, req.items(), req)
            : itemRepo.findByContractIdOrderBySortOrderAsc(id);

    List<CrmContractCashflow> cashflows =
        cashflowRepo.findByContractIdOrderByTransactionDateDescCreatedAtDesc(id);
    recalculateFinancials(contract, cashflows);

    CrmContract saved = contractRepo.save(contract);
    return toDto(saved, items);
  }

  @Transactional
  public CrmContractDto updateRevenueStatus(String id, String revenueStatus) {
    CrmContract contract = requireContract(id);
    contract.setRevenueStatus(blankToDefault(revenueStatus, "Bản nháp"));
    contract.setUpdatedBy(currentActorId());
    contract.setUpdatedAt(Instant.now());
    CrmContract saved = contractRepo.save(contract);
    List<CrmContractItem> items = itemRepo.findByContractIdOrderBySortOrderAsc(id);
    return toDto(saved, items);
  }

  @Transactional
  public void delete(String id) {
    CrmContract contract = requireContract(id);
    Instant now = Instant.now();
    contract.setDeleted(true);
    contract.setDeletedAt(now);
    contract.setDeletedBy(currentActorName());
    contract.setUpdatedAt(now);
    contract.setUpdatedBy(currentActorId());
    contractRepo.save(contract);
  }

  @Transactional
  public CrmContractDto restore(String id) {
    CrmContract contract = requireContract(id);
    contract.setDeleted(false);
    contract.setDeletedAt(null);
    contract.setDeletedBy(null);
    contract.setUpdatedAt(Instant.now());
    contract.setUpdatedBy(currentActorId());
    CrmContract saved = contractRepo.save(contract);
    List<CrmContractItem> items = itemRepo.findByContractIdOrderBySortOrderAsc(id);
    return toDto(saved, items);
  }

  @Transactional
  public void permanentDelete(String id) {
    CrmContract contract = requireContract(id);
    cashflowRepo.deleteByContractId(id);
    itemRepo.deleteByContractId(id);
    contractRepo.delete(contract);
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

    List<CrmContract> rows = contractRepo.findAllById(ids);
    Instant now = Instant.now();
    String actorId = currentActorId();
    String actorName = currentActorName();
    int affected = 0;

    for (CrmContract contract : rows) {
      switch (action) {
        case "ASSIGN" -> {
          contract.setAssignedUserId(trimOrNull(req.assignedUserId()));
          contract.setAssignedUserName(trimOrNull(req.assignedUserName()));
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "SHARE" -> {
          contract.setShared(req.shared() != null ? req.shared() : true);
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "UNSHARE" -> {
          contract.setShared(false);
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "ADD_TAG" -> {
          contract.setTags(addTagToJsonList(contract.getTags(), req.tag()));
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "REMOVE_TAG" -> {
          contract.setTags(removeTagFromJsonList(contract.getTags(), req.tag()));
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "DELETE" -> {
          contract.setDeleted(true);
          contract.setDeletedAt(now);
          contract.setDeletedBy(actorName);
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "RESTORE" -> {
          contract.setDeleted(false);
          contract.setDeletedAt(null);
          contract.setDeletedBy(null);
          contract.setUpdatedAt(now);
          contract.setUpdatedBy(actorId);
          contractRepo.save(contract);
          affected++;
        }
        case "PERMANENT_DELETE" -> {
          cashflowRepo.deleteByContractId(contract.getId());
          itemRepo.deleteByContractId(contract.getId());
          contractRepo.delete(contract);
          affected++;
        }
        default ->
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Unsupported bulk action: " + req.action());
      }
    }
    return affected;
  }

  @Transactional(readOnly = true)
  public List<CrmContractCashflowDto> listCashflows(String contractId, String type) {
    requireContract(contractId);
    List<CrmContractCashflow> rows =
        hasText(type)
            ? cashflowRepo.findByContractIdAndTypeOrderByTransactionDateDescCreatedAtDesc(
                contractId, type.trim().toUpperCase())
            : cashflowRepo.findByContractIdOrderByTransactionDateDescCreatedAtDesc(contractId);
    return rows.stream().map(this::toCashflowDto).toList();
  }

  @Transactional
  public CrmContractCashflowDto addCashflow(String contractId, CashflowCreateRequest req) {
    CrmContract contract = requireContract(contractId);
    String type = blankToDefault(req.type(), "THUC_THU").toUpperCase();
    String desc = hasText(req.description()) ? req.description().trim() : trimOrNull(req.note());
    LocalDate txDate =
        req.transactionDate() != null ? req.transactionDate() : LocalDate.now(VN_ZONE);

    CrmContractCashflow cf =
        CrmContractCashflow.builder()
            .id(newId())
            .contractId(contractId)
            .type(type)
            .category(trimOrNull(req.category()))
            .description(desc)
            .amount(money(req.amount()))
            .transactionDate(txDate)
            .paymentMethod(blankToDefault(req.paymentMethod(), "Chuyển khoản"))
            .referenceCode(trimOrNull(req.referenceCode()))
            .status(blankToDefault(req.status(), "Đã xác nhận"))
            .createdBy(currentActorId())
            .createdByName(currentActorName())
            .createdAt(Instant.now())
            .build();

    CrmContractCashflow savedCf = cashflowRepo.save(cf);

    List<CrmContractCashflow> allCashflows =
        new ArrayList<>(
            cashflowRepo.findByContractIdOrderByTransactionDateDescCreatedAtDesc(contractId));
    if (allCashflows.stream().noneMatch(row -> Objects.equals(row.getId(), savedCf.getId()))) {
      allCashflows.add(savedCf);
    }
    recalculateFinancials(contract, allCashflows);
    contract.setUpdatedAt(Instant.now());
    contract.setUpdatedBy(currentActorId());
    contractRepo.save(contract);

    return toCashflowDto(savedCf);
  }

  @Transactional
  public void deleteCashflow(String contractId, String cashflowId) {
    CrmContract contract = requireContract(contractId);
    CrmContractCashflow cf =
        cashflowRepo
            .findById(cashflowId)
            .filter(row -> contractId.equals(row.getContractId()))
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cashflow not found"));

    String deletedType = cf.getType();
    cashflowRepo.delete(cf);

    List<CrmContractCashflow> remaining =
        cashflowRepo.findByContractIdOrderByTransactionDateDescCreatedAtDesc(contractId).stream()
            .filter(row -> !Objects.equals(row.getId(), cashflowId))
            .toList();

    if ("THUC_THU".equalsIgnoreCase(deletedType)
        && remaining.stream().noneMatch(r -> "THUC_THU".equalsIgnoreCase(r.getType()))) {
      contract.setCollectedAmount(BigDecimal.ZERO);
    }
    if ("DU_KIEN_CHI".equalsIgnoreCase(deletedType)
        && remaining.stream().noneMatch(r -> "DU_KIEN_CHI".equalsIgnoreCase(r.getType()))) {
      contract.setPlannedExpense(BigDecimal.ZERO);
    }
    if ("THUC_CHI".equalsIgnoreCase(deletedType)
        && remaining.stream().noneMatch(r -> "THUC_CHI".equalsIgnoreCase(r.getType()))) {
      contract.setActualExpense(BigDecimal.ZERO);
    }

    recalculateFinancials(contract, remaining);
    contract.setUpdatedAt(Instant.now());
    contract.setUpdatedBy(currentActorId());
    contractRepo.save(contract);
  }

  @Transactional
  public int importContracts(List<ContractUpsertRequest> items) {
    if (items == null || items.isEmpty()) {
      return 0;
    }
    for (ContractUpsertRequest item : items) {
      create(item);
    }
    return items.size();
  }

  public CrmContract requireContract(String id) {
    return contractRepo
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
  }

  /** Recalculates all stored financial rollups and profit metrics on the contract. */
  public void recalculateFinancials(CrmContract contract, List<CrmContractCashflow> cashflows) {
    List<CrmContractCashflow> safeCashflows = cashflows != null ? cashflows : List.of();

    List<CrmContractCashflow> thucThu =
        safeCashflows.stream().filter(c -> "THUC_THU".equalsIgnoreCase(c.getType())).toList();
    List<CrmContractCashflow> duKienChi =
        safeCashflows.stream().filter(c -> "DU_KIEN_CHI".equalsIgnoreCase(c.getType())).toList();
    List<CrmContractCashflow> thucChi =
        safeCashflows.stream().filter(c -> "THUC_CHI".equalsIgnoreCase(c.getType())).toList();

    BigDecimal orderValue = money(contract.getOrderValue());
    contract.setOrderValue(orderValue);

    BigDecimal collectedAmount;
    if (!thucThu.isEmpty()) {
      collectedAmount =
          money(
              thucThu.stream()
                  .map(c -> money(c.getAmount()))
                  .reduce(BigDecimal.ZERO, BigDecimal::add));
      if (contract.getPaymentDate() == null) {
        thucThu.stream()
            .map(CrmContractCashflow::getTransactionDate)
            .filter(Objects::nonNull)
            .max(Comparator.naturalOrder())
            .ifPresent(contract::setPaymentDate);
      }
    } else {
      collectedAmount = money(contract.getCollectedAmount());
    }
    contract.setCollectedAmount(collectedAmount);

    BigDecimal componentExpenses =
        money(contract.getServiceExpense())
            .add(money(contract.getStateFeeExpense()))
            .add(money(contract.getSupportExpense()));

    BigDecimal plannedExpense;
    if (!duKienChi.isEmpty()) {
      plannedExpense =
          money(
              duKienChi.stream()
                  .map(c -> money(c.getAmount()))
                  .reduce(BigDecimal.ZERO, BigDecimal::add));
    } else if (componentExpenses.compareTo(BigDecimal.ZERO) > 0) {
      plannedExpense = money(componentExpenses);
    } else {
      plannedExpense = money(contract.getPlannedExpense());
    }
    contract.setPlannedExpense(plannedExpense);

    BigDecimal actualExpense;
    if (!thucChi.isEmpty()) {
      actualExpense =
          money(
              thucChi.stream()
                  .map(c -> money(c.getAmount()))
                  .reduce(BigDecimal.ZERO, BigDecimal::add));
    } else {
      actualExpense = money(contract.getActualExpense());
    }
    contract.setActualExpense(actualExpense);

    BigDecimal receivable = money(orderValue.subtract(collectedAmount));
    BigDecimal payable = money(plannedExpense.subtract(actualExpense).max(BigDecimal.ZERO));
    BigDecimal costBasis =
        actualExpense.compareTo(plannedExpense) > 0 ? actualExpense : plannedExpense;
    BigDecimal estimatedProfit = money(orderValue.subtract(costBasis));

    contract.setReceivableAmount(receivable);
    contract.setPayableAmount(payable);
    contract.setEstimatedProfit(estimatedProfit);
    contract.setLiquidationValue(money(contract.getLiquidationValue()));
    contract.setServiceExpense(money(contract.getServiceExpense()));
    contract.setStateFeeExpense(money(contract.getStateFeeExpense()));
    contract.setSupportExpense(money(contract.getSupportExpense()));
    contract.setUninvoicedAmount(money(contract.getUninvoicedAmount()));
  }

  private void applyFields(CrmContract contract, ContractUpsertRequest req, boolean isCreate) {
    contract.setAccountId(trimOrNull(req.accountId()));
    String accountCode = trimOrNull(req.accountCode());
    String accountName = trimOrNull(req.accountName());
    if (hasText(contract.getAccountId()) && (!hasText(accountName) || !hasText(accountCode))) {
      CrmAccount acc = accountRepo.findById(contract.getAccountId()).orElse(null);
      if (acc != null) {
        if (!hasText(accountCode)) accountCode = acc.getCode();
        if (!hasText(accountName)) accountName = acc.getCustomerName();
      }
    }
    contract.setAccountCode(accountCode);
    contract.setAccountName(accountName);
    contract.setContactName(trimOrNull(req.contactName()));
    contract.setOpportunityId(trimOrNull(req.opportunityId()));
    contract.setParentContractNumber(trimOrNull(req.parentContractNumber()));
    if (hasText(req.goodsSummary()) || isCreate) {
      contract.setGoodsSummary(trimOrNull(req.goodsSummary()));
    }
    contract.setBookingDate(
        req.bookingDate() != null
            ? req.bookingDate()
            : (isCreate ? LocalDate.now(VN_ZONE) : contract.getBookingDate()));
    contract.setPaymentDate(req.paymentDate());
    contract.setSubmissionDate(req.submissionDate());
    contract.setHandoverDeadline(req.handoverDeadline());
    contract.setOrderDate(req.orderDate());
    contract.setProductionDeadline(req.productionDeadline());

    contract.setRevenueStatus(blankToDefault(req.revenueStatus(), "Bản nháp"));
    contract.setExecutionStatus(blankToDefault(req.executionStatus(), "Chưa thực hiện"));
    contract.setArchivedStatus(blankToDefault(req.archivedStatus(), "Chưa có"));
    contract.setLeadSource(trimOrNull(req.leadSource()));
    contract.setContractSource(trimOrNull(req.contractSource()));
    contract.setPaymentTermType(trimOrNull(req.paymentTermType()));
    contract.setAssignedUserId(trimOrNull(req.assignedUserId()));
    contract.setAssignedUserName(trimOrNull(req.assignedUserName()));
    contract.setDepartment(trimOrNull(req.department()));
    contract.setUnitName(trimOrNull(req.unitName()));

    if (req.liquidationValue() != null || isCreate) {
      contract.setLiquidationValue(money(req.liquidationValue()));
    }
    if (req.orderValue() != null || isCreate) {
      contract.setOrderValue(money(req.orderValue()));
    }
    if (req.collectedAmount() != null || isCreate) {
      contract.setCollectedAmount(money(req.collectedAmount()));
    }
    if (req.actualExpense() != null || isCreate) {
      contract.setActualExpense(money(req.actualExpense()));
    }
    if (req.plannedExpense() != null || isCreate) {
      contract.setPlannedExpense(money(req.plannedExpense()));
    }
    if (req.serviceExpense() != null || isCreate) {
      contract.setServiceExpense(money(req.serviceExpense()));
    }
    if (req.stateFeeExpense() != null || isCreate) {
      contract.setStateFeeExpense(money(req.stateFeeExpense()));
    }
    if (req.supportExpense() != null || isCreate) {
      contract.setSupportExpense(money(req.supportExpense()));
    }
    if (req.uninvoicedAmount() != null || isCreate) {
      contract.setUninvoicedAmount(money(req.uninvoicedAmount()));
    }

    contract.setInvoiceLookupCode(trimOrNull(req.invoiceLookupCode()));
    contract.setInvoiceLookupUrl(trimOrNull(req.invoiceLookupUrl()));
    contract.setExternalOrderNumber(trimOrNull(req.externalOrderNumber()));
    contract.setInvoiceCustomerName(
        hasText(req.invoiceCustomerName()) ? req.invoiceCustomerName().trim() : accountName);
    contract.setBuyerName(trimOrNull(req.buyerName()));
    contract.setInvoiceCountry(blankToDefault(req.invoiceCountry(), "Việt Nam"));
    contract.setInvoiceProvince(trimOrNull(req.invoiceProvince()));
    contract.setInvoiceDistrict(trimOrNull(req.invoiceDistrict()));
    contract.setInvoiceAddress(trimOrNull(req.invoiceAddress()));
    contract.setTaxCode(trimOrNull(req.taxCode()));
    if (req.shared() != null) {
      contract.setShared(req.shared());
    }
    contract.setReferrer(trimOrNull(req.referrer()));
    if (req.syncPriceAfterDiscount() != null) {
      contract.setSyncPriceAfterDiscount(req.syncPriceAfterDiscount());
    }
    contract.setNotes(trimOrNull(req.notes()));
    if (isCreate || req.tags() != null) {
      contract.setTags(toJsonList(req.tags()));
    }
  }

  private List<CrmContractItem> replaceItems(
      CrmContract contract, List<CrmLineItemDto> rawItems, ContractUpsertRequest req) {
    itemRepo.deleteByContractId(contract.getId());
    if (rawItems == null || rawItems.isEmpty()) {
      return List.of();
    }
    List<CrmContractItem> entities = new ArrayList<>(rawItems.size());
    BigDecimal sumTotal = BigDecimal.ZERO;
    List<String> summaryLabels = new ArrayList<>();

    for (int i = 0; i < rawItems.size(); i++) {
      CrmLineItemDto computed = computeLineItem(rawItems.get(i), i);
      sumTotal = sumTotal.add(computed.totalAmount());
      String label = hasText(computed.description()) ? computed.description() : computed.itemCode();
      if (hasText(label) && !summaryLabels.contains(label)) {
        summaryLabels.add(label);
      }
      entities.add(
          CrmContractItem.builder()
              .id(newId())
              .contractId(contract.getId())
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

    List<CrmContractItem> saved = itemRepo.saveAll(entities);
    if (saved == null || saved.isEmpty()) {
      saved = entities;
    }

    boolean shouldSyncOrderValue =
        req.orderValue() == null
            || req.orderValue().compareTo(BigDecimal.ZERO) <= 0
            || Boolean.TRUE.equals(req.syncOrderValueFromItems());
    if (shouldSyncOrderValue) {
      contract.setOrderValue(money(sumTotal));
    }
    if (!summaryLabels.isEmpty()) {
      contract.setGoodsSummary(String.join(", ", summaryLabels));
    }
    return saved;
  }

  private String nextContractNumber() {
    int max =
        contractRepo
            .findTopByContractNumberStartingWithOrderByContractNumberDesc("PD26")
            .map(c -> parseTrailingNumber(c.getContractNumber(), "PD26"))
            .orElse(0);
    int seq = max == 0 ? 1076 : Math.max(max + 1, 1076);
    String candidate = String.format("PD26%04d", seq);
    while (contractRepo.existsByContractNumber(candidate)) {
      seq++;
      candidate = String.format("PD26%04d", seq);
    }
    return candidate;
  }

  private List<CrmContractDto> toDtos(List<CrmContract> contracts) {
    if (contracts == null || contracts.isEmpty()) {
      return List.of();
    }
    List<String> ids = contracts.stream().map(CrmContract::getId).toList();
    List<CrmContractItem> allItems = itemRepo.findByContractIdInOrderBySortOrderAsc(ids);
    Map<String, List<CrmContractItem>> itemsByContract =
        (allItems == null ? List.<CrmContractItem>of() : allItems)
            .stream().collect(Collectors.groupingBy(CrmContractItem::getContractId));
    return contracts.stream()
        .map(c -> toDto(c, itemsByContract.getOrDefault(c.getId(), List.of())))
        .toList();
  }

  private CrmContractDto toDto(CrmContract c, List<CrmContractItem> items) {
    List<CrmLineItemDto> lineDtos =
        (items == null ? List.<CrmContractItem>of() : items).stream().map(this::toItemDto).toList();
    return new CrmContractDto(
        c.getId(),
        c.getContractNumber(),
        c.getAccountId(),
        c.getAccountCode(),
        c.getAccountName(),
        c.getContactName(),
        c.getOpportunityId(),
        c.getParentContractNumber(),
        c.getGoodsSummary(),
        c.getBookingDate(),
        c.getPaymentDate(),
        c.getSubmissionDate(),
        c.getHandoverDeadline(),
        c.getOrderDate(),
        c.getProductionDeadline(),
        c.getRevenueStatus(),
        c.getExecutionStatus(),
        c.getArchivedStatus(),
        c.getLeadSource(),
        c.getContractSource(),
        c.getPaymentTermType(),
        c.getAssignedUserId(),
        c.getAssignedUserName(),
        c.getDepartment(),
        c.getUnitName(),
        money(c.getLiquidationValue()),
        money(c.getOrderValue()),
        money(c.getCollectedAmount()),
        money(c.getActualExpense()),
        money(c.getPlannedExpense()),
        money(c.getReceivableAmount()),
        money(c.getPayableAmount()),
        money(c.getEstimatedProfit()),
        money(c.getServiceExpense()),
        money(c.getStateFeeExpense()),
        money(c.getSupportExpense()),
        money(c.getUninvoicedAmount()),
        c.getInvoiceLookupCode(),
        c.getInvoiceLookupUrl(),
        c.getExternalOrderNumber(),
        c.getInvoiceCustomerName(),
        c.getBuyerName(),
        c.getInvoiceCountry(),
        c.getInvoiceProvince(),
        c.getInvoiceDistrict(),
        c.getInvoiceAddress(),
        c.getTaxCode(),
        c.isShared(),
        c.getReferrer(),
        c.isSyncPriceAfterDiscount(),
        c.getNotes(),
        lineDtos,
        c.getCreatedBy(),
        c.getUpdatedBy(),
        c.getCreatedAt(),
        c.getUpdatedAt(),
        fromJsonList(c.getTags()),
        c.isDeleted(),
        c.getDeletedAt(),
        c.getDeletedBy());
  }

  private CrmLineItemDto toItemDto(CrmContractItem i) {
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

  private CrmContractCashflowDto toCashflowDto(CrmContractCashflow cf) {
    return new CrmContractCashflowDto(
        cf.getId(),
        cf.getContractId(),
        cf.getType(),
        cf.getCategory(),
        cf.getDescription(),
        money(cf.getAmount()),
        cf.getTransactionDate(),
        cf.getPaymentMethod(),
        cf.getReferenceCode(),
        cf.getStatus(),
        cf.getCreatedBy(),
        cf.getCreatedByName(),
        cf.getCreatedAt());
  }
}

package org.law_app.crm.event;

import java.time.Instant;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.crm.config.RabbitConfig;
import org.law_app.crm.domain.CareStatus;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.ProcessedCaseEvent;
import org.law_app.crm.repository.CareStatusRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.repository.ProcessedCaseEventRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Keeps the CRM read-replica in sync. Idempotent upsert keyed by caseId, so re-delivery and the
 * backfill (which republishes case.created) are safe. Care-owned columns are never overwritten by
 * sync — only the replicated case columns.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CaseEventListener {

  private final CrmCaseRepository caseRepo;
  private final CareStatusRepository careStatusRepo;
  private final ProcessedCaseEventRepository inboxRepo;

  @RabbitListener(queues = RabbitConfig.QUEUE_CASES)
  @Transactional
  public void onCaseEvent(CaseEvent event, @Header("amqp_receivedRoutingKey") String routingKey) {
    if (event.getCaseId() == null) {
      log.warn("Skipping case event with null caseId (rk={})", routingKey);
      return;
    }
    if (event.getEventId() != null && inboxRepo.existsById(event.getEventId())) {
      log.debug("Skipping duplicate case event {}", event.getEventId());
      return;
    }
    CrmCase c = caseRepo.findById(event.getCaseId()).orElse(null);
    boolean isNew = c == null;
    if (isNew) {
      c = CrmCase.builder().id(event.getCaseId()).build();
    }

    Date eventTimestamp =
        event.getUpdatedAt() != null ? event.getUpdatedAt() : event.getCreatedAt();
    boolean stale =
        eventTimestamp != null
            && c.getCaseUpdatedAt() != null
            && eventTimestamp.before(c.getCaseUpdatedAt());

    // status-only events carry just id+status+timestamps; don't clobber fields with null.
    if (!stale) {
      if (event.getCustomerId() != null) c.setCustomerId(event.getCustomerId());
      if (event.getCustomerEmail() != null) c.setCustomerEmail(event.getCustomerEmail());
      if (event.getCustomerPhone() != null) c.setCustomerPhone(event.getCustomerPhone());
      if (event.getServiceId() != null) c.setServiceId(event.getServiceId());
      if (event.getServiceName() != null) c.setServiceName(event.getServiceName());
      if (event.getName() != null) c.setName(event.getName());
      if (event.getDescription() != null) c.setDescription(event.getDescription());
      if (event.getStatus() != null) c.setStatus(event.getStatus());
      if (event.getCreatedAt() != null) c.setCaseCreatedAt(event.getCreatedAt());
      if (event.getUpdatedAt() != null) c.setCaseUpdatedAt(event.getUpdatedAt());
      c.setSyncedAt(Instant.now());
    }

    // New case → assign the default care status if one is configured.
    if (isNew && c.getCareStatusId() == null) {
      CareStatus def = careStatusRepo.findFirstByIsDefaultTrue();
      if (def != null) c.setCareStatusId(def.getId());
    }

    caseRepo.save(c);
    if (event.getEventId() != null && !event.getEventId().isBlank()) {
      inboxRepo.save(
          ProcessedCaseEvent.builder()
              .eventId(event.getEventId())
              .caseId(event.getCaseId())
              .routingKey(routingKey)
              .processedAt(Instant.now())
              .build());
    }
    log.debug(
        "Synced case {} (rk={}, new={}, stale={})", event.getCaseId(), routingKey, isNew, stale);
  }
}

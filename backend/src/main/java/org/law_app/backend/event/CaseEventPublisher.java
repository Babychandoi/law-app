package org.law_app.backend.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.entity.OutboxEvent;
import org.law_app.backend.repository.OutboxEventRepository;
import org.springframework.stereotype.Component;

/** Writes case integration events to the transactional outbox. */
@Slf4j
@Component
@RequiredArgsConstructor
public class CaseEventPublisher {

  public static final String RK_CREATED = "case.created";
  public static final String RK_STATUS_CHANGED = "case.statusChanged";

  private final OutboxEventRepository outboxRepository;
  private final ObjectMapper objectMapper;

  public void publish(String routingKey, CaseEvent event) {
    Instant now = Instant.now();
    if (event.getEventId() == null || event.getEventId().isBlank()) {
      event.setEventId(UUID.randomUUID().toString());
    }
    if (event.getOccurredAt() == null) {
      event.setOccurredAt(now);
    }
    try {
      outboxRepository.save(
          OutboxEvent.builder()
              .id(event.getEventId())
              .aggregateType("CASE")
              .aggregateId(event.getCaseId())
              .eventType(routingKey)
              .routingKey(routingKey)
              .payload(objectMapper.writeValueAsString(event))
              .occurredAt(event.getOccurredAt())
              .nextAttemptAt(now)
              .build());
    } catch (JsonProcessingException e) {
      // Serialization is deterministic for this DTO. Failing the surrounding transaction is safer
      // than committing a case change that downstream systems can never observe.
      throw new IllegalStateException("Cannot serialize case integration event", e);
    }
  }
}

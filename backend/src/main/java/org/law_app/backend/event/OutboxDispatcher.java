package org.law_app.backend.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.config.RabbitConfig;
import org.law_app.backend.entity.OutboxEvent;
import org.law_app.backend.repository.OutboxEventRepository;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** At-least-once dispatcher for the transactional outbox. Consumers must remain idempotent. */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxDispatcher {

  private final OutboxEventRepository repository;
  private final RabbitTemplate rabbitTemplate;
  private final ObjectMapper objectMapper;

  @Value("${app.outbox.batch-size:50}")
  private int batchSize;

  @Scheduled(fixedDelayString = "${app.outbox.dispatch-delay-ms:1000}")
  @Transactional
  public void dispatch() {
    Instant now = Instant.now();
    for (OutboxEvent row :
        repository.lockNextBatch(now, PageRequest.of(0, Math.max(1, Math.min(batchSize, 200))))) {
      try {
        CaseEvent payload = objectMapper.readValue(row.getPayload(), CaseEvent.class);
        CorrelationData correlation = new CorrelationData(row.getId());
        rabbitTemplate.convertAndSend(
            RabbitConfig.EXCHANGE,
            row.getRoutingKey(),
            payload,
            message -> {
              message.getMessageProperties().setMessageId(row.getId());
              message.getMessageProperties().setHeader("eventId", row.getId());
              message.getMessageProperties().setHeader("schemaVersion", payload.getSchemaVersion());
              return message;
            },
            correlation);
        CorrelationData.Confirm confirmation = correlation.getFuture().get(5, TimeUnit.SECONDS);
        if (!confirmation.isAck()) {
          throw new IllegalStateException("Broker rejected event: " + confirmation.getReason());
        }
        row.setPublishedAt(now);
        row.setLastError(null);
      } catch (Exception e) {
        int attempt = row.getAttempts() + 1;
        row.setAttempts(attempt);
        row.setLastError(abbreviate(e.getMessage(), 1000));
        long backoffSeconds = Math.min(3600L, 1L << Math.min(attempt, 11));
        row.setNextAttemptAt(now.plusSeconds(backoffSeconds));
        log.warn(
            "Outbox delivery failed (eventId={}, attempt={}, retryIn={}s): {}",
            row.getId(),
            attempt,
            backoffSeconds,
            e.getMessage());
      }
      repository.save(row);
    }
  }

  @Scheduled(cron = "${app.outbox.cleanup-cron:0 20 3 * * *}")
  @Transactional
  public void cleanup() {
    int removed = repository.deletePublishedBefore(Instant.now().minus(Duration.ofDays(30)));
    if (removed > 0) {
      log.info("Removed {} delivered outbox rows past retention", removed);
    }
  }

  private static String abbreviate(String value, int maxLength) {
    if (value == null) return "Unknown delivery error";
    return value.length() <= maxLength ? value : value.substring(0, maxLength);
  }
}

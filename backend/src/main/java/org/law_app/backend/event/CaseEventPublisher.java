package org.law_app.backend.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.config.RabbitConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/** Fire-and-forget publisher for case events. Failures are logged, never block the main flow. */
@Slf4j
@Component
@RequiredArgsConstructor
public class CaseEventPublisher {

  public static final String RK_CREATED = "case.created";
  public static final String RK_STATUS_CHANGED = "case.statusChanged";

  private final RabbitTemplate rabbitTemplate;

  public void publish(String routingKey, CaseEvent event) {
    try {
      rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, routingKey, event);
    } catch (Exception e) {
      // CRM sync is best-effort; a missed event is reconciled by backfill, never breaks the case.
      log.error(
          "Failed to publish {} for case {}: {}", routingKey, event.getCaseId(), e.getMessage());
    }
  }
}

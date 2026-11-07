package org.law_app.crm.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class RabbitConfigTest {
  @Test
  void newQueuesRetainDeadLetterArgumentsByDefault() {
    var queue = new RabbitConfig().crmCasesQueue();
    assertThat(queue.isDurable()).isTrue();
    assertThat(queue.getArguments())
        .containsEntry("x-dead-letter-exchange", RabbitConfig.DEAD_LETTER_EXCHANGE)
        .containsEntry("x-dead-letter-routing-key", RabbitConfig.QUEUE_CASES_DEAD);
  }

  @Test
  void legacyQueueCanUseBrokerPolicyWithoutChangingImmutableArguments() {
    var config = new RabbitConfig();
    ReflectionTestUtils.setField(config, "caseQueueDeadLetterArguments", false);
    var queue = config.crmCasesQueue();
    assertThat(queue.getName()).isEqualTo(RabbitConfig.QUEUE_CASES);
    assertThat(queue.isDurable()).isTrue();
    assertThat(queue.getArguments()).isEmpty();
    assertThat(config.crmCasesDeadQueue().getName()).isEqualTo(RabbitConfig.QUEUE_CASES_DEAD);
    assertThat(config.crmCasesDeadBinding().getRoutingKey())
        .isEqualTo(RabbitConfig.QUEUE_CASES_DEAD);
  }
}

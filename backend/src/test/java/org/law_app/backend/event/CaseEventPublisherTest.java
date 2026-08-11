package org.law_app.backend.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.backend.entity.OutboxEvent;
import org.law_app.backend.repository.OutboxEventRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CaseEventPublisherTest {

  @Mock private OutboxEventRepository repository;

  @Test
  void storesAnIdentifiedVersionedEventInTheTransactionalOutbox() {
    when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    CaseEventPublisher publisher =
        new CaseEventPublisher(repository, new ObjectMapper().findAndRegisterModules());

    publisher.publish(
        CaseEventPublisher.RK_CREATED,
        CaseEvent.builder()
            .caseId("case-1")
            .customerId("customer-1")
            .serviceId("service-1")
            .build());

    ArgumentCaptor<OutboxEvent> row = ArgumentCaptor.forClass(OutboxEvent.class);
    verify(repository).save(row.capture());
    assertThat(row.getValue().getId()).isNotBlank();
    assertThat(row.getValue().getAggregateType()).isEqualTo("CASE");
    assertThat(row.getValue().getAggregateId()).isEqualTo("case-1");
    assertThat(row.getValue().getRoutingKey()).isEqualTo("case.created");
    assertThat(row.getValue().getPayload())
        .contains("\"eventId\"")
        .contains("\"schemaVersion\":1")
        .contains("\"serviceId\":\"service-1\"");
    assertThat(row.getValue().getOccurredAt()).isNotNull();
  }
}

package org.law_app.crm.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.crm.domain.CrmCase;
import org.law_app.crm.domain.ProcessedCaseEvent;
import org.law_app.crm.repository.CareStatusRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.repository.ProcessedCaseEventRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CaseEventListenerTest {

  @Mock private CrmCaseRepository caseRepository;
  @Mock private CareStatusRepository careStatusRepository;
  @Mock private ProcessedCaseEventRepository inboxRepository;

  @Test
  void skipsAnAlreadyProcessedDelivery() {
    when(inboxRepository.existsById("event-1")).thenReturn(true);
    CaseEventListener listener =
        new CaseEventListener(caseRepository, careStatusRepository, inboxRepository);
    CaseEvent event = new CaseEvent();
    event.setEventId("event-1");
    event.setCaseId("case-1");

    listener.onCaseEvent(event, "case.created");

    verify(caseRepository, never()).findById(any());
    verify(caseRepository, never()).save(any());
  }

  @Test
  void recordsButDoesNotApplyAnOutOfOrderEvent() {
    Date currentTimestamp = new Date(2_000_000L);
    CrmCase current =
        CrmCase.builder()
            .id("case-1")
            .status("PROCESSING")
            .serviceId("service-new")
            .caseUpdatedAt(currentTimestamp)
            .syncedAt(Instant.parse("2026-07-29T01:00:00Z"))
            .build();
    when(inboxRepository.existsById("event-old")).thenReturn(false);
    when(caseRepository.findById("case-1")).thenReturn(Optional.of(current));
    CaseEventListener listener =
        new CaseEventListener(caseRepository, careStatusRepository, inboxRepository);
    CaseEvent event = new CaseEvent();
    event.setEventId("event-old");
    event.setCaseId("case-1");
    event.setStatus("NEW");
    event.setServiceId("service-old");
    event.setUpdatedAt(new Date(1_000_000L));

    listener.onCaseEvent(event, "case.statusChanged");

    ArgumentCaptor<CrmCase> saved = ArgumentCaptor.forClass(CrmCase.class);
    verify(caseRepository).save(saved.capture());
    assertThat(saved.getValue().getStatus()).isEqualTo("PROCESSING");
    assertThat(saved.getValue().getServiceId()).isEqualTo("service-new");
    verify(inboxRepository).save(any(ProcessedCaseEvent.class));
  }
}

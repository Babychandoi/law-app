package org.law_app.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.response.NotificationResponse;
import org.law_app.backend.entity.NotificationUser;
import org.law_app.backend.mapper.NotificationMapper;
import org.law_app.backend.repository.CustomerServiceRepository;
import org.law_app.backend.repository.NotificationUserRepository;
import org.law_app.backend.service.impl.CustomerServiceImpl;
import org.law_app.backend.service.impl.NotificationServiceImpl;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class QueryOptimizationTest {
  @Mock CustomerServiceRepository customerServiceRepository;
  @Mock NotificationUserRepository notificationUserRepository;
  @Mock NotificationMapper notificationMapper;
  @InjectMocks CustomerServiceImpl customers;
  @InjectMocks NotificationServiceImpl notifications;

  @Test
  void dashboardCountsIncludeCompletedCanceledAndNullStatusInTotal() {
    when(customerServiceRepository.countByStatus())
        .thenReturn(
            List.of(
                count(Status.NEW, 3),
                count(Status.RECEIVED, 4),
                count(Status.PROCESSING, 5),
                count(Status.COMPLETED, 6),
                count(Status.CANCELED, 7),
                count(null, 2)));
    var stats = customers.getStats();
    assertThat(stats.total()).isEqualTo(27);
    assertThat(stats.newLead()).isEqualTo(3);
    assertThat(stats.pending()).isEqualTo(9);
    verifyNoMoreInteractions(customerServiceRepository);
  }

  @Test
  void emptyDashboardReturnsZeroCounts() {
    when(customerServiceRepository.countByStatus()).thenReturn(List.of());
    assertThat(customers.getStats().total()).isZero();
    assertThat(customers.getStats().pending()).isZero();
    assertThat(customers.getStats().newLead()).isZero();
  }

  @Test
  void notificationPageKeepsTotalAndOnlyMapsRequestedRows() {
    var pageable = PageRequest.of(2, 5);
    var row = NotificationUser.builder().id("notification-1").build();
    var dto = NotificationResponse.builder().id("notification-1").build();
    when(notificationUserRepository.findByUser_Id("user-1", pageable))
        .thenReturn(new PageImpl<>(List.of(row), pageable, 11));
    when(notificationMapper.toNotificationResponse(row)).thenReturn(dto);
    var page = notifications.getNotificationPage("user-1", pageable);
    assertThat(page.getContent()).containsExactly(dto);
    assertThat(page.getTotalElements()).isEqualTo(11);
    assertThat(page.getNumber()).isEqualTo(2);
    assertThat(page.hasNext()).isFalse();
    verifyNoMoreInteractions(notificationUserRepository);
  }

  @Test
  void unreadCountIncludesNotificationsOutsideLoadedPage() {
    when(notificationUserRepository.countByUser_IdAndReadFalse("user-1")).thenReturn(42L);
    assertThat(notifications.getUnreadCount("user-1")).isEqualTo(42L);
    verifyNoInteractions(notificationMapper);
  }

  private CustomerServiceRepository.StatusCount count(Status status, long total) {
    return new CustomerServiceRepository.StatusCount() {
      @Override
      public Status getStatus() {
        return status;
      }

      @Override
      public long getCount() {
        return total;
      }
    };
  }
}

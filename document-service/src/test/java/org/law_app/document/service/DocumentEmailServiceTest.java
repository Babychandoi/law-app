package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.server.ResponseStatusException;

/** P2.3: gửi email — tắt mặc định; thiếu URL công khai -> 503 (không rò rỉ, không gửi bừa). */
class DocumentEmailServiceTest {

  @SuppressWarnings("unchecked")
  private final ObjectProvider<JavaMailSender> mailProvider = mock(ObjectProvider.class);

  private final DocumentShareService shareService = mock(DocumentShareService.class);

  @Test
  void throwsWhenDisabled() {
    DocumentEmailService service =
        new DocumentEmailService(false, "no-reply@x", "https://g", mailProvider, shareService);
    assertThatThrownBy(() -> service.sendShareLink("g1", "kh@x.com", null, null, null))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(e -> assertStatus(e, HttpStatus.SERVICE_UNAVAILABLE));
  }

  @Test
  void throwsWhenPublicBaseUrlMissing() {
    DocumentEmailService service =
        new DocumentEmailService(true, "no-reply@x", "", mailProvider, shareService);
    assertThatThrownBy(() -> service.sendShareLink("g1", "kh@x.com", null, null, null))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(e -> assertStatus(e, HttpStatus.SERVICE_UNAVAILABLE));
  }

  private void assertStatus(Throwable e, HttpStatus expected) {
    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(expected);
  }
}

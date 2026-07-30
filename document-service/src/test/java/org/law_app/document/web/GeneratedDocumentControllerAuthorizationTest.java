package org.law_app.document.web;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.service.DocumentAuditService;
import org.law_app.document.service.GeneratedDocumentService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GeneratedDocumentControllerAuthorizationTest {
  @Mock private GeneratedDocumentService service;
  @Mock private DocumentAuditService auditService;
  @InjectMocks private GeneratedDocumentController controller;

  @Test
  void auditLookupAuthorizesDocumentBeforeReadingAuditEvents() {
    when(service.get("other-users-document"))
        .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden"));

    assertThatThrownBy(() -> controller.audit("other-users-document", 0, 20))
        .isInstanceOf(ResponseStatusException.class);
    verifyNoInteractions(auditService);
  }
}

package org.law_app.crm.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Party endpoints fail closed when their dedicated 256-bit encryption key is unavailable. */
@ResponseStatus(
    value = HttpStatus.SERVICE_UNAVAILABLE,
    reason = "Matter-party data protection is unavailable")
public class PartyEncryptionUnavailableException extends RuntimeException {

  public PartyEncryptionUnavailableException() {
    super("Matter-party data protection is unavailable");
  }
}

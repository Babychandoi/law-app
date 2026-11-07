package org.law_app.crm.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Raised without disclosing ciphertext details when authenticated decryption fails. */
@ResponseStatus(
    value = HttpStatus.INTERNAL_SERVER_ERROR,
    reason = "Protected matter-party data could not be verified")
public class PartyDataIntegrityException extends RuntimeException {

  public PartyDataIntegrityException(Throwable cause) {
    super("Protected matter-party data could not be verified", cause);
  }

  public PartyDataIntegrityException() {
    super("Protected matter-party data could not be verified");
  }
}

package org.law_app.chat.config;

import java.security.Principal;

/** Carries the authenticated staff userId as the STOMP session principal. */
public record StompPrincipal(String name) implements Principal {
  @Override
  public String getName() {
    return name;
  }
}

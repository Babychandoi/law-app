package org.law_app.backend.websocket;

import java.security.Principal;

/**
 * STOMP principal for guest chat. {@code admin} is derived server-side from a validated ADMIN JWT
 * at handshake — never from a client-supplied header.
 */
public class ChatPrincipal implements Principal {
  private final String name;
  private final boolean admin;

  public ChatPrincipal(String name, boolean admin) {
    this.name = name;
    this.admin = admin;
  }

  @Override
  public String getName() {
    return name;
  }

  public boolean isAdmin() {
    return admin;
  }
}

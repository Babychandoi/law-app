package org.law_app.chat.web;

import org.springframework.security.core.context.SecurityContextHolder;

/** Reads the authenticated staff userId (JWT subject) from the security context. */
public final class CurrentUser {

  private CurrentUser() {}

  public static String id() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    return auth == null ? null : auth.getName();
  }
}

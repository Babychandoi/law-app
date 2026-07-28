package org.law_app.crm.web;

import org.springframework.security.core.context.SecurityContextHolder;

/** Authenticated staff userId (JWT subject) + role from the security context. */
public final class CurrentUser {
  private CurrentUser() {}

  public static String id() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    return auth == null ? null : auth.getName();
  }

  public static boolean isAdmin() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    return auth != null
        && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
  }
}

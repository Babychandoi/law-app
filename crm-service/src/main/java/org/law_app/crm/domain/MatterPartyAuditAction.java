package org.law_app.crm.domain;

/** Security-relevant operations recorded in the append-only matter-party audit trail. */
public enum MatterPartyAuditAction {
  CREATE,
  UPDATE,
  ARCHIVE,
  READ
}

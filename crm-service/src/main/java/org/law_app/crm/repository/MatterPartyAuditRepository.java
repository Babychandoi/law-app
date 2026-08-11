package org.law_app.crm.repository;

import org.law_app.crm.domain.MatterPartyAudit;
import org.springframework.data.repository.Repository;

/**
 * Insert-only repository. Deliberately does not inherit delete methods, preserving the audit trail
 * through the application's persistence API.
 */
public interface MatterPartyAuditRepository extends Repository<MatterPartyAudit, String> {

  MatterPartyAudit save(MatterPartyAudit audit);
}

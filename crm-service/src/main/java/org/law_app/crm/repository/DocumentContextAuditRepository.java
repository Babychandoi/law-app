package org.law_app.crm.repository;

import org.law_app.crm.domain.DocumentContextAudit;
import org.springframework.data.repository.Repository;

/** Insert-only persistence boundary for document-context access evidence. */
public interface DocumentContextAuditRepository extends Repository<DocumentContextAudit, String> {

  DocumentContextAudit save(DocumentContextAudit audit);
}

package org.law_app.document.repository;

import org.law_app.document.domain.DocumentAuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentAuditEventRepository extends MongoRepository<DocumentAuditEvent, String> {
  Page<DocumentAuditEvent> findByEntityTypeAndEntityId(
      String entityType, String entityId, Pageable pageable);
}

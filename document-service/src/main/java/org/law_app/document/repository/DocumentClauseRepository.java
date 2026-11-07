package org.law_app.document.repository;

import java.util.List;
import org.law_app.document.domain.DocumentClause;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentClauseRepository extends MongoRepository<DocumentClause, String> {
  List<DocumentClause> findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus status);

  List<DocumentClause> findAllByOrderByUpdatedAtDesc();
}

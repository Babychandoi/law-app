package org.law_app.document.repository;

import java.util.List;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentTemplateRepository extends MongoRepository<DocumentTemplate, String> {
  List<DocumentTemplate> findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus status);

  List<DocumentTemplate> findAllByOrderByUpdatedAtDesc();
}

package org.law_app.document.repository;

import java.util.List;
import org.law_app.document.domain.DocumentBundle;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentBundleRepository extends MongoRepository<DocumentBundle, String> {
  List<DocumentBundle> findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus status);

  List<DocumentBundle> findAllByOrderByUpdatedAtDesc();
}

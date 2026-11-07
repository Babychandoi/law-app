package org.law_app.document.repository;

import java.util.List;
import org.law_app.document.domain.DocumentFolder;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentFolderRepository extends MongoRepository<DocumentFolder, String> {
  List<DocumentFolder> findAllByOrderByNameAsc();
}

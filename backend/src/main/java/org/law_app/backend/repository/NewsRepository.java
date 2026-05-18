package org.law_app.backend.repository;

import org.law_app.backend.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends JpaRepository<News, String> {
    // This interface will automatically provide CRUD operations for the News entity
    // Additional custom query methods can be defined here if needed
}

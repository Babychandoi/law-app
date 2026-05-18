package org.law_app.backend.repository;

import org.law_app.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    // This interface will automatically provide CRUD operations for Notification entities
    // Additional custom query methods can be defined here if needed
}

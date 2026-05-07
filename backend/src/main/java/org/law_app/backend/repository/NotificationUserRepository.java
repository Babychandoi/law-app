package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.NotificationUser;
import org.law_app.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationUserRepository extends JpaRepository<NotificationUser, String> {
  List<NotificationUser> findByUser(User user);
}

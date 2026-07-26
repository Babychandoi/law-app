package org.law_app.backend.repository;

import java.util.Optional;
import org.law_app.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  Page<User>
      findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
          String username, String fullName, String email, Pageable pageable);
}

package org.law_app.backend.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.backend.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
  Optional<Conversation> findByGuestId(String guestId);

  List<Conversation> findAllByOrderByUpdatedAtDesc();

  Page<Conversation> findAllByOrderByUpdatedAtDesc(Pageable pageable);

  List<Conversation> findByAssignedAdmin(String adminId);

  long countByAssignedAdmin(String adminId);

  long countByUnreadCountGreaterThan(int unreadCount);

  @Query("{ 'unreadCount' : { $gt: 0 } }")
  List<Conversation> findAllUnreadConversations();
}

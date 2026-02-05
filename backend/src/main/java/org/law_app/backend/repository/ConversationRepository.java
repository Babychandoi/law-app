package org.law_app.backend.repository;

import org.law_app.backend.entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Optional<Conversation> findByGuestId(String guestId);

    List<Conversation> findAllByOrderByUpdatedAtDesc();

    List<Conversation> findByAssignedAdmin(String adminId);

    @Query("{ 'unreadCount' : { $gt: 0 } }")
    List<Conversation> findAllUnreadConversations();
}

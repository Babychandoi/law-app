package org.law_app.backend.repository;

import org.law_app.backend.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByGuestIdOrderByCreatedAtAsc(String guestId);

    @Query("{ 'guestId': ?0, 'isRead': false }")
    List<ChatMessage> findUnreadMessagesByGuestId(String guestId);

    ChatMessage findTopByGuestIdOrderByCreatedAtDesc(String guestId);

    @Query("{ 'createdAt': { $gte: ?0 } }")
    List<ChatMessage> findMessagesSinceDate(Date date);
}

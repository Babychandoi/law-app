package org.law_app.chat.service;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.law_app.chat.dto.Dtos.PresenceEvent;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Tracks staff online state in Redis (TTL-refreshed via WS heartbeat) so presence is consistent
 * across multiple chat-service instances, and broadcasts changes over {@code
 * /topic/staff/presence}.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

  private static final String PRESENCE_PREFIX = "presence:staff:";
  private static final Duration TTL = Duration.ofSeconds(60);

  private final StringRedisTemplate redis;
  private final SimpMessagingTemplate messagingTemplate;

  public void markOnline(String userId) {
    boolean wasOffline = Boolean.FALSE.equals(redis.hasKey(PRESENCE_PREFIX + userId));
    redis.opsForValue().set(PRESENCE_PREFIX + userId, "1", TTL);
    if (wasOffline) {
      messagingTemplate.convertAndSend("/topic/staff.presence", new PresenceEvent(userId, true));
    }
  }

  /** Called on WS heartbeat to keep the key alive without re-broadcasting. */
  public void heartbeat(String userId) {
    redis.opsForValue().set(PRESENCE_PREFIX + userId, "1", TTL);
  }

  public void markOffline(String userId) {
    redis.delete(PRESENCE_PREFIX + userId);
    messagingTemplate.convertAndSend("/topic/staff.presence", new PresenceEvent(userId, false));
  }

  public boolean isOnline(String userId) {
    return Boolean.TRUE.equals(redis.hasKey(PRESENCE_PREFIX + userId));
  }

  public Set<String> onlineUsers() {
    // Dùng SCAN (cursor, non-blocking) thay cho KEYS — KEYS quét toàn keyspace và BLOCK Redis
    // (nguy hiểm khi keyspace lớn). SCAN duyệt tăng dần, an toàn cho production.
    Set<String> users = new HashSet<>();
    ScanOptions options = ScanOptions.scanOptions().match(PRESENCE_PREFIX + "*").count(200).build();
    try (Cursor<String> cursor = redis.scan(options)) {
      while (cursor.hasNext()) {
        users.add(cursor.next().substring(PRESENCE_PREFIX.length()));
      }
    }
    return users;
  }
}

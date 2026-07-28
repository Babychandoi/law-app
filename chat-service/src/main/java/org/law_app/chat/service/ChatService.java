package org.law_app.chat.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.chat.domain.Conversation;
import org.law_app.chat.domain.ConversationType;
import org.law_app.chat.domain.MemberRole;
import org.law_app.chat.domain.Membership;
import org.law_app.chat.domain.Message;
import org.law_app.chat.domain.MessageType;
import org.law_app.chat.dto.Dtos.AttachmentDto;
import org.law_app.chat.dto.Dtos.ConversationSummary;
import org.law_app.chat.dto.Dtos.CreateGroupRequest;
import org.law_app.chat.dto.Dtos.InboxEvent;
import org.law_app.chat.dto.Dtos.LastMessageDto;
import org.law_app.chat.dto.Dtos.MessageDto;
import org.law_app.chat.dto.Dtos.SendMessageRequest;
import org.law_app.chat.repository.ConversationRepository;
import org.law_app.chat.repository.MembershipRepository;
import org.law_app.chat.repository.MessageRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

  private static final int MESSAGE_PAGE_SIZE = 30;

  private final ConversationRepository conversationRepo;
  private final MembershipRepository membershipRepo;
  private final MessageRepository messageRepo;
  private final SimpMessagingTemplate messagingTemplate;
  private final FileStorageService fileStorageService;
  private final MongoTemplate mongoTemplate;

  // ---------------- Conversations ----------------

  /** Open (or reuse) a 1-1 conversation between the caller and the target. */
  public ConversationSummary openDirect(String me, String targetUserId) {
    if (me.equals(targetUserId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot DM yourself");
    }
    String directKey = directKey(me, targetUserId);
    List<Conversation> existing = conversationRepo.findByDirectKeyOrderByCreatedAtAsc(directKey);
    Conversation conv;
    if (!existing.isEmpty()) {
      // Reuse the oldest; tolerate legacy duplicates from before the unique index.
      conv = existing.get(0);
    } else {
      Instant now = Instant.now();
      try {
        conv =
            conversationRepo.save(
                Conversation.builder()
                    .type(ConversationType.DIRECT)
                    .createdBy(me)
                    .directKey(directKey)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
        ensureMembership(conv.getId(), me, MemberRole.OWNER, now);
        ensureMembership(conv.getId(), targetUserId, MemberRole.MEMBER, now);
      } catch (DuplicateKeyException race) {
        // A concurrent request created the same DM first (unique directKey index). Reuse it.
        conv =
            conversationRepo.findByDirectKeyOrderByCreatedAtAsc(directKey).stream()
                .findFirst()
                .orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.CONFLICT, "Conversation race"));
      }
    }
    return toSummary(conv, me);
  }

  public ConversationSummary createGroup(String me, CreateGroupRequest req) {
    Instant now = Instant.now();
    ConversationType type = req.type() == null ? ConversationType.GROUP : req.type();
    Conversation conv =
        conversationRepo.save(
            Conversation.builder()
                .type(type)
                .name(req.name())
                .createdBy(me)
                .createdAt(now)
                .updatedAt(now)
                .build());

    ensureMembership(conv.getId(), me, MemberRole.OWNER, now);
    for (String uid : req.memberIds()) {
      if (!uid.equals(me)) {
        ensureMembership(conv.getId(), uid, MemberRole.MEMBER, now);
      }
    }
    // Let new members' inboxes know about the conversation.
    notifyInbox(conv.getId(), "CONVERSATION_CREATED");
    return toSummary(conv, me);
  }

  public List<ConversationSummary> myInbox(String me) {
    // Trước đây 2N+1 query (mỗi hội thoại tải riêng conversation + members). Giờ 3 query:
    // (1) memberships của tôi, (2) batch conversations, (3) batch members của các hội thoại đó.
    List<Membership> mine = membershipRepo.findByUserIdOrderByUpdatedAtDesc(me);
    if (mine.isEmpty()) {
      return List.of();
    }
    List<String> convIds = mine.stream().map(Membership::getConversationId).toList();

    Map<String, Conversation> convById =
        conversationRepo.findAllById(convIds).stream()
            .collect(Collectors.toMap(Conversation::getId, c -> c));
    Map<String, List<Membership>> membersByConv =
        membershipRepo.findByConversationIdIn(convIds).stream()
            .collect(Collectors.groupingBy(Membership::getConversationId));

    // Giữ nguyên thứ tự updatedAt-desc từ `mine`; unread lấy từ chính membership của tôi.
    return mine.stream()
        .map(
            m -> {
              Conversation c = convById.get(m.getConversationId());
              if (c == null) {
                return null;
              }
              List<Membership> members =
                  membersByConv.getOrDefault(m.getConversationId(), List.of());
              return toSummary(c, members, m.getUnreadCount());
            })
        .filter(java.util.Objects::nonNull)
        .toList();
  }

  public void addMember(String me, String conversationId, String userId) {
    Conversation conv = requireConversation(conversationId);
    requireOwner(conversationId, me);
    ensureMembership(conv.getId(), userId, MemberRole.MEMBER, Instant.now());
    notifyInbox(conversationId, "MEMBER_ADDED");
  }

  public void removeMember(String me, String conversationId, String userId) {
    requireConversation(conversationId);
    // Leaving yourself only needs membership; removing someone else requires OWNER.
    if (me.equals(userId)) {
      requireMember(conversationId, me);
    } else {
      requireOwner(conversationId, me);
    }
    membershipRepo.deleteByConversationIdAndUserId(conversationId, userId);
  }

  public ConversationSummary link(
      String me, String conversationId, String customerId, String customerServiceId) {
    Conversation conv = requireConversation(conversationId);
    requireOwner(conversationId, me);
    conv.setLinkedCustomerId(customerId);
    conv.setLinkedCustomerServiceId(customerServiceId);
    conv.setUpdatedAt(Instant.now());
    conversationRepo.save(conv);
    return toSummary(conv, me);
  }

  // ---------------- Messages ----------------

  public List<MessageDto> history(String me, String conversationId, Instant before) {
    requireMember(conversationId, me);
    PageRequest page =
        PageRequest.of(0, MESSAGE_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt"));
    List<Message> msgs =
        before == null
            ? messageRepo.findByConversationIdOrderByCreatedAtDesc(conversationId, page)
            : messageRepo.findPageBefore(conversationId, before, page);
    List<MessageDto> dtos = new ArrayList<>(msgs.stream().map(this::toMessageDto).toList());
    dtos.sort(Comparator.comparing(MessageDto::createdAt)); // ascending for display
    return dtos;
  }

  /** Persist a message, fan it out over STOMP, and bump unread for everyone except the sender. */
  public MessageDto postMessage(String senderId, SendMessageRequest req) {
    Conversation conv = requireConversation(req.conversationId());
    requireMember(req.conversationId(), senderId);

    Instant now = Instant.now();
    MessageType type = req.type() == null ? MessageType.TEXT : req.type();
    List<Message.Attachment> attachments =
        req.attachments() == null
            ? List.of()
            : req.attachments().stream()
                .map(a -> new Message.Attachment(a.url(), a.name(), a.mime(), a.size()))
                .toList();

    Message saved =
        messageRepo.save(
            Message.builder()
                .conversationId(req.conversationId())
                .senderId(senderId)
                .content(req.content())
                .type(type)
                .attachments(attachments)
                .readBy(new ArrayList<>(List.of(senderId)))
                .createdAt(now)
                .build());

    // Update conversation + per-member state.
    conv.setLastMessage(new Conversation.LastMessage(previewOf(saved), senderId, now));
    conv.setUpdatedAt(now);
    conversationRepo.save(conv);

    List<Membership> members = membershipRepo.findByConversationId(conv.getId());

    // Cập nhật per-member bằng 2 lệnh bulk ATOMIC (thay vì N lần save):
    //  - mọi member: set updatedAt
    //  - member khác sender: $inc unreadCount (atomic -> không mất increment khi tin đến đồng thời)
    mongoTemplate.updateMulti(
        new Query(Criteria.where("conversationId").is(conv.getId())),
        new Update().set("updatedAt", now),
        Membership.class);
    mongoTemplate.updateMulti(
        new Query(
            Criteria.where("conversationId").is(conv.getId()).and("userId").ne(senderId)),
        new Update().inc("unreadCount", 1),
        Membership.class);

    // Fan-out inbox cho từng member khác sender (STOMP, không phải DB). Count = old+1 (best-effort
    // để hiển thị; giá trị chuẩn nằm ở DB qua $inc atomic).
    String preview = previewOf(saved);
    for (Membership m : members) {
      if (!m.getUserId().equals(senderId)) {
        messagingTemplate.convertAndSendToUser(
            m.getUserId(),
            "/queue/staff.inbox",
            new InboxEvent(
                "NEW_MESSAGE", conv.getId(), m.getUnreadCount() + 1, senderId, preview));
      }
    }

    MessageDto dto = toMessageDto(saved);
    messagingTemplate.convertAndSend("/topic/staff.conv." + conv.getId(), dto);
    return dto;
  }

  public void markRead(String me, String conversationId) {
    Membership m = requireMember(conversationId, me);
    m.setUnreadCount(0);
    m.setLastReadAt(Instant.now());
    membershipRepo.save(m);
  }

  // ---------------- helpers ----------------

  private void ensureMembership(
      String conversationId, String userId, MemberRole role, Instant now) {
    if (!membershipRepo.existsByConversationIdAndUserId(conversationId, userId)) {
      membershipRepo.save(
          Membership.builder()
              .conversationId(conversationId)
              .userId(userId)
              .role(role)
              .joinedAt(now)
              .updatedAt(now)
              .unreadCount(0)
              .build());
    }
  }

  private void notifyInbox(String conversationId, String eventType) {
    for (Membership m : membershipRepo.findByConversationId(conversationId)) {
      messagingTemplate.convertAndSendToUser(
          m.getUserId(),
          "/queue/staff.inbox",
          new InboxEvent(eventType, conversationId, m.getUnreadCount(), null, null));
    }
  }

  private Conversation requireConversation(String id) {
    return conversationRepo
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
  }

  private Membership requireMember(String conversationId, String userId) {
    return membershipRepo
        .findByConversationIdAndUserId(conversationId, userId)
        .orElseThrow(
            () ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of conversation"));
  }

  /** Managing members / linking a CRM case requires the caller to be the group OWNER. */
  private Membership requireOwner(String conversationId, String userId) {
    Membership m = requireMember(conversationId, userId);
    if (m.getRole() != MemberRole.OWNER) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Only the group owner can perform this action");
    }
    return m;
  }

  /** Dùng cho 1 hội thoại đơn lẻ (tự tải members — 1 query). */
  private ConversationSummary toSummary(Conversation c, String me) {
    List<Membership> members = membershipRepo.findByConversationId(c.getId());
    int unread =
        members.stream()
            .filter(m -> m.getUserId().equals(me))
            .findFirst()
            .map(Membership::getUnreadCount)
            .orElse(0);
    return toSummary(c, members, unread);
  }

  /** Dùng khi đã có sẵn members + unread (tránh query lại — cho inbox batch). */
  private ConversationSummary toSummary(Conversation c, List<Membership> members, int unread) {
    LastMessageDto last =
        c.getLastMessage() == null
            ? null
            : new LastMessageDto(
                c.getLastMessage().getContent(),
                c.getLastMessage().getSenderId(),
                c.getLastMessage().getAt());
    return new ConversationSummary(
        c.getId(),
        c.getType(),
        c.getName(),
        c.getCreatedBy(),
        members.stream().map(Membership::getUserId).toList(),
        c.getLinkedCustomerId(),
        c.getLinkedCustomerServiceId(),
        last,
        unread,
        c.getUpdatedAt());
  }

  private MessageDto toMessageDto(Message m) {
    List<AttachmentDto> atts =
        m.getAttachments() == null
            ? List.of()
            : m.getAttachments().stream()
                .map(
                    a ->
                        new AttachmentDto(
                            fileStorageService.presignUrl(a.getUrl()),
                            a.getName(),
                            a.getMime(),
                            a.getSize()))
                .toList();
    return new MessageDto(
        m.getId(),
        m.getConversationId(),
        m.getSenderId(),
        m.getContent(),
        m.getType(),
        atts,
        m.getReadBy(),
        m.getCreatedAt(),
        m.getEditedAt());
  }

  private String previewOf(Message m) {
    if (m.getType() == MessageType.TEXT) {
      return m.getContent();
    }
    return m.getType() == MessageType.IMAGE ? "[Hình ảnh]" : "[Tệp đính kèm]";
  }

  private static String directKey(String a, String b) {
    return a.compareTo(b) < 0 ? a + ":" + b : b + ":" + a;
  }
}

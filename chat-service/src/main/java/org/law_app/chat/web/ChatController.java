package org.law_app.chat.web;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.chat.dto.Dtos.AddMemberRequest;
import org.law_app.chat.dto.Dtos.ConversationSummary;
import org.law_app.chat.dto.Dtos.CreateDirectRequest;
import org.law_app.chat.dto.Dtos.CreateGroupRequest;
import org.law_app.chat.dto.Dtos.LinkRequest;
import org.law_app.chat.dto.Dtos.MessageDto;
import org.law_app.chat.service.ChatService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

  private final ChatService chatService;

  @GetMapping("/conversations")
  public ApiResponse<List<ConversationSummary>> inbox() {
    return ApiResponse.ok(chatService.myInbox(CurrentUser.id()));
  }

  @PostMapping("/conversations/direct")
  public ApiResponse<ConversationSummary> openDirect(@Valid @RequestBody CreateDirectRequest req) {
    return ApiResponse.ok(chatService.openDirect(CurrentUser.id(), req.targetUserId()));
  }

  /** Only admins may create group/channel conversations and name them. */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/conversations/group")
  public ApiResponse<ConversationSummary> createGroup(@Valid @RequestBody CreateGroupRequest req) {
    return ApiResponse.ok(chatService.createGroup(CurrentUser.id(), req));
  }

  @GetMapping("/conversations/{id}/messages")
  public ApiResponse<List<MessageDto>> messages(
      @PathVariable String id, @RequestParam(required = false) Instant before) {
    return ApiResponse.ok(chatService.history(CurrentUser.id(), id, before));
  }

  @PutMapping("/conversations/{id}/read")
  public ApiResponse<Void> read(@PathVariable String id) {
    chatService.markRead(CurrentUser.id(), id);
    return ApiResponse.ok(null, "Marked as read");
  }

  @PostMapping("/conversations/{id}/members")
  public ApiResponse<Void> addMember(
      @PathVariable String id, @Valid @RequestBody AddMemberRequest req) {
    chatService.addMember(CurrentUser.id(), id, req.userId());
    return ApiResponse.ok(null, "Member added");
  }

  @DeleteMapping("/conversations/{id}/members/{userId}")
  public ApiResponse<Void> removeMember(@PathVariable String id, @PathVariable String userId) {
    chatService.removeMember(CurrentUser.id(), id, userId);
    return ApiResponse.ok(null, "Member removed");
  }

  @PostMapping("/conversations/{id}/link")
  public ApiResponse<ConversationSummary> link(
      @PathVariable String id, @RequestBody LinkRequest req) {
    return ApiResponse.ok(
        chatService.link(CurrentUser.id(), id, req.customerId(), req.customerServiceId()));
  }
}

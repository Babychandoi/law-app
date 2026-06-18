package org.law_app.chat.web;

import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.law_app.chat.dto.Dtos.SendMessageRequest;
import org.law_app.chat.dto.Dtos.TypingRequest;
import org.law_app.chat.service.ChatService;
import org.law_app.chat.service.PresenceService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/** STOMP message handlers. Principal is set by the CONNECT auth interceptor. */
@Controller
@RequiredArgsConstructor
public class ChatWsController {

  private final ChatService chatService;
  private final PresenceService presenceService;
  private final SimpMessagingTemplate messagingTemplate;

  /** Client publishes to /app/staff.send. Persistence + fan-out happens in ChatService. */
  @MessageMapping("/staff.send")
  public void send(@Payload SendMessageRequest req, Principal principal) {
    presenceService.heartbeat(principal.getName());
    chatService.postMessage(principal.getName(), req);
  }

  /** Client publishes to /app/staff.typing -> relayed to the conversation topic. */
  @MessageMapping("/staff.typing")
  public void typing(@Payload TypingRequest req, Principal principal) {
    presenceService.heartbeat(principal.getName());
    messagingTemplate.convertAndSend(
        "/topic/staff.conv." + req.conversationId(),
        Map.of("event", "TYPING", "userId", principal.getName()));
  }
}

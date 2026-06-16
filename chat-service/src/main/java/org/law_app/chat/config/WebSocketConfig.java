package org.law_app.chat.config;

import org.law_app.chat.security.StompAuthChannelInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket backed by a RabbitMQ broker relay so messages fan out across multiple
 * chat-service instances. Client destinations:
 *
 * <ul>
 *   <li>publish {@code /app/staff.send}, {@code /app/staff.typing}
 *   <li>subscribe {@code /topic/staff/conv/{conversationId}}, {@code /topic/staff/presence}
 *   <li>user queue {@code /user/queue/staff/inbox}
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${rabbitmq.stomp.host}")
  private String relayHost;

  @Value("${rabbitmq.stomp.port}")
  private int relayPort;

  @Value("${rabbitmq.user}")
  private String relayUser;

  @Value("${rabbitmq.pass}")
  private String relayPass;

  @Value("${cors.allowed-origins}")
  private String allowedOrigins;

  private final StompAuthChannelInterceptor authInterceptor;

  // @Lazy breaks the init cycle: the interceptor transitively needs SimpMessagingTemplate, which is
  // created by the broker config this class drives.
  public WebSocketConfig(@Lazy StompAuthChannelInterceptor authInterceptor) {
    this.authInterceptor = authInterceptor;
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config
        .enableStompBrokerRelay("/topic", "/queue")
        .setRelayHost(relayHost)
        .setRelayPort(relayPort)
        .setClientLogin(relayUser)
        .setClientPasscode(relayPass)
        .setSystemLogin(relayUser)
        .setSystemPasscode(relayPass);
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry
        .addEndpoint("/ws-staff")
        .setAllowedOriginPatterns(allowedOrigins.split(","))
        .withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(authInterceptor);
  }
}

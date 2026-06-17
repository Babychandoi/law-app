package org.law_app.backend.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Publishes CRM domain events (case.created, case.statusChanged) to a shared topic exchange that
 * the crm-service consumes to keep its read-replica in sync.
 */
@Configuration
public class RabbitConfig {

  public static final String EXCHANGE = "law-app.events";

  @Bean
  public TopicExchange lawAppEventsExchange() {
    return new TopicExchange(EXCHANGE, true, false);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory cf, MessageConverter converter) {
    RabbitTemplate template = new RabbitTemplate(cf);
    template.setMessageConverter(converter);
    return template;
  }
}

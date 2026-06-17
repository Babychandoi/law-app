package org.law_app.crm.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Consumes case events from the monolith's {@code law-app.events} topic exchange and keeps the CRM
 * read-replica in sync. Durable queue so events survive a CRM restart.
 */
@Configuration
@EnableRabbit
public class RabbitConfig {

  public static final String EXCHANGE = "law-app.events";
  public static final String QUEUE_CASES = "crm.cases";

  @Bean
  public TopicExchange lawAppEventsExchange() {
    return new TopicExchange(EXCHANGE, true, false);
  }

  @Bean
  public Queue crmCasesQueue() {
    return new Queue(QUEUE_CASES, true);
  }

  @Bean
  public Binding crmCasesBinding() {
    // case.created, case.statusChanged
    return BindingBuilder.bind(crmCasesQueue()).to(lawAppEventsExchange()).with("case.*");
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
      ConnectionFactory cf, MessageConverter converter) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(cf);
    factory.setMessageConverter(converter);
    return factory;
  }
}

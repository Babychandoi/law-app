package org.law_app.crm.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
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
  public static final String DEAD_LETTER_EXCHANGE = "law-app.events.dlx";
  public static final String QUEUE_CASES_DEAD = "crm.cases.dead";

  @Bean
  public TopicExchange lawAppEventsExchange() {
    return new TopicExchange(EXCHANGE, true, false);
  }

  @Bean
  public Queue crmCasesQueue() {
    return QueueBuilder.durable(QUEUE_CASES)
        .deadLetterExchange(DEAD_LETTER_EXCHANGE)
        .deadLetterRoutingKey(QUEUE_CASES_DEAD)
        .build();
  }

  @Bean
  public DirectExchange deadLetterExchange() {
    return new DirectExchange(DEAD_LETTER_EXCHANGE, true, false);
  }

  @Bean
  public Queue crmCasesDeadQueue() {
    return QueueBuilder.durable(QUEUE_CASES_DEAD).build();
  }

  @Bean
  public Binding crmCasesDeadBinding() {
    return BindingBuilder.bind(crmCasesDeadQueue()).to(deadLetterExchange()).with(QUEUE_CASES_DEAD);
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
    factory.setDefaultRequeueRejected(false);
    factory.setAdviceChain(
        RetryInterceptorBuilder.stateless()
            .maxAttempts(5)
            .backOffOptions(1000, 2.0, 30_000)
            .recoverer(new RejectAndDontRequeueRecoverer())
            .build());
    return factory;
  }
}

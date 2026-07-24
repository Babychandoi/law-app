package org.law_app.backend.config;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Executor RIÊNG có giới hạn cho tác vụ gọi AI (guest chat). Trước đây dùng
 * CompletableFuture.runAsync (ForkJoinPool.commonPool) -> khi tải cao sẽ chiếm hết common pool và
 * không có backpressure. Ở đây: core/max nhỏ + hàng đợi giới hạn + AbortPolicy để KHÔNG nhận thêm
 * khi quá tải (ChatController bắt RejectedExecutionException và bỏ qua, thay vì làm nghẽn).
 */
@Configuration
public class AiExecutorConfig {

  @Bean("aiExecutor")
  public Executor aiExecutor() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(2);
    ex.setMaxPoolSize(4);
    ex.setQueueCapacity(50);
    ex.setThreadNamePrefix("ai-chat-");
    ex.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
    ex.initialize();
    return ex;
  }
}

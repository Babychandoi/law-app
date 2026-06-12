package org.law_app.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.NewsRequest;
import org.law_app.backend.dto.response.NewsResponse;
import org.law_app.backend.dto.response.SubscriberResponse;
import org.law_app.backend.entity.CustomerSubscribe;
import org.law_app.backend.entity.News;
import org.law_app.backend.mapper.NewsMapper;
import org.law_app.backend.repository.CustomerSubscribeRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.security.MinioConfig;
import org.law_app.backend.service.EmailService;
import org.law_app.backend.service.MinioService;
import org.law_app.backend.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class NewsServiceImpl implements NewsService {
  NewsRepository newsRepository;
  CustomerSubscribeRepository customerSubscribeRepository;
  EmailService emailService;
  NewsMapper newsMapper;
  MinioService minioService;
  MinioConfig minioConfig;

  @Override
  @Transactional
  public NewsResponse createNews(NewsRequest newsRequest) {
    try {
      // Generate slug from title FIRST
      String slug = generateSlug(newsRequest.getTitle());

      // Check if slug exists, if yes, append number
      String finalSlug = slug;
      int counter = 1;
      while (newsRepository.existsById(finalSlug)) {
        finalSlug = slug + "-" + counter;
        counter++;
      }

      // Set the ID in the request before mapping
      newsRequest.setId(finalSlug);

      // Map to entity (will include fullContent)
      News news = newsMapper.toNews(newsRequest);

      // Save the news with fullContent
      news = newsRepository.save(news);

      NewsResponse newsResponse = newsMapper.toNewsResponse(news);

      // Only generate URL if image is not already a full URL
      String imageUrl = news.getImage();
      if (imageUrl != null && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        imageUrl = minioService.generateFileUrl(minioConfig.getImagesBucket(), imageUrl);
      }
      newsResponse.setImage(imageUrl);

      return newsResponse;
    } catch (Exception e) {
      log.error("Error creating news: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to create news", e);
    }
  }

  private String generateSlug(String title) {
    if (title == null || title.isEmpty()) {
      return "untitled";
    }

    // Convert Vietnamese characters to ASCII
    String slug = title.toLowerCase();

    // Vietnamese character mapping
    slug = slug.replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a");
    slug = slug.replaceAll("[èéẹẻẽêềếệểễ]", "e");
    slug = slug.replaceAll("[ìíịỉĩ]", "i");
    slug = slug.replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o");
    slug = slug.replaceAll("[ùúụủũưừứựửữ]", "u");
    slug = slug.replaceAll("[ỳýỵỷỹ]", "y");
    slug = slug.replaceAll("đ", "d");

    // Remove special characters and replace spaces with hyphens
    slug = slug.replaceAll("[^a-z0-9\\s-]", "");
    slug = slug.trim().replaceAll("\\s+", "-");
    slug = slug.replaceAll("-+", "-");

    // Remove leading/trailing hyphens
    slug = slug.replaceAll("^-+|-+$", "");

    return slug.isEmpty() ? "untitled" : slug;
  }

  @Override
  public List<NewsResponse> getAllNews() {
    try {
      List<News> news = newsRepository.findAll();
      return news.stream().map(this::toSummaryResponse).collect(Collectors.toList());
    } catch (Exception e) {
      log.error("Error fetching all news: {}", e.getMessage());
      throw new RuntimeException("Failed to fetch news", e);
    }
  }

  @Override
  public Page<NewsResponse> getAllNews(Pageable pageable) {
    try {
      return newsRepository.findAll(pageable).map(this::toSummaryResponse);
    } catch (Exception e) {
      log.error("Error fetching paged news: {}", e.getMessage());
      throw new RuntimeException("Failed to fetch news", e);
    }
  }

  private NewsResponse toSummaryResponse(News news) {
    String imageUrl = news.getImage();
    if (imageUrl != null && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      imageUrl = minioService.generateFileUrl(minioConfig.getImagesBucket(), imageUrl);
    }
    return NewsResponse.builder()
        .id(news.getId())
        .title(news.getTitle())
        .subtitle(news.getSubtitle())
        .author(news.getAuthor())
        .image(imageUrl)
        .createdAt(news.getCreatedAt())
        .build();
  }

  @Override
  public NewsResponse getNewsById(String id) {
    try {
      News news =
          newsRepository
              .findById(id)
              .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
      NewsResponse newsResponse = newsMapper.toNewsResponse(news);

      // Only generate URL if image is not already a full URL
      String imageUrl = news.getImage();
      if (imageUrl != null && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        imageUrl = minioService.generateFileUrl(minioConfig.getImagesBucket(), imageUrl);
      }
      newsResponse.setImage(imageUrl);

      return newsResponse;
    } catch (Exception e) {
      log.error("Error fetching news by id: {}", e.getMessage());
      throw new RuntimeException("Failed to fetch news by id", e);
    }
  }

  @Transactional
  @Override
  public NewsResponse updateNews(String id, NewsRequest newsRequest) {
    try {
      News existingNews =
          newsRepository
              .findById(id)
              .orElseThrow(() -> new RuntimeException("News not found with id: " + id));

      // Update news from request
      newsMapper.updateNewsFromRequest(existingNews, newsRequest);

      NewsResponse newsResponse = newsMapper.toNewsResponse(existingNews);

      // Only generate URL if image is not already a full URL
      String imageUrl = existingNews.getImage();
      if (imageUrl != null && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        imageUrl = minioService.generateFileUrl(minioConfig.getImagesBucket(), imageUrl);
      }
      newsResponse.setImage(imageUrl);

      return newsResponse;
    } catch (Exception e) {
      log.error("Error updating news: {}", e.getMessage());
      throw new RuntimeException("Failed to update news", e);
    }
  }

  @Transactional
  @Override
  public Boolean deleteNews(String id) {
    try {
      News news =
          newsRepository
              .findById(id)
              .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
      newsRepository.delete(news);
      return true;
    } catch (Exception e) {
      log.error("Error deleting news: {}", e.getMessage());
      throw new RuntimeException("Failed to delete news", e);
    }
  }

  @Override
  public String subscribe(String email) {
    try {
      if (customerSubscribeRepository.existsByEmail(email)) {
        return "Bạn đã được đăng ký nhận thông báo trước đó!";
      }
      CustomerSubscribe customerSubscribe =
          CustomerSubscribe.builder().email(email).createdAt(LocalDateTime.now()).build();
      customerSubscribeRepository.save(customerSubscribe);
      String title = "Chào mừng bạn đến với luật Poip";
      String content =
          """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            padding: 20px;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 20px;
                            text-align: center;
                            color: #ffffff;
                        }
                        .header h1 {
                            font-size: 28px;
                            margin-bottom: 10px;
                            font-weight: 600;
                        }
                        .header p {
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .icon-container {
                            text-align: center;
                            padding: 30px 20px 20px;
                        }
                        .icon {
                            width: 80px;
                            height: 80px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 50%;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 40px;
                        }
                        .content {
                            padding: 20px 40px 40px;
                            color: #333333;
                        }
                        .content h2 {
                            color: #667eea;
                            font-size: 24px;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        .content p {
                            line-height: 1.8;
                            font-size: 16px;
                            margin-bottom: 15px;
                            color: #555555;
                        }
                        .benefits {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin: 25px 0;
                            border-radius: 5px;
                        }
                        .benefits h3 {
                            color: #667eea;
                            font-size: 18px;
                            margin-bottom: 15px;
                        }
                        .benefits ul {
                            list-style: none;
                            padding: 0;
                        }
                        .benefits li {
                            padding: 8px 0;
                            padding-left: 25px;
                            position: relative;
                            color: #555555;
                        }
                        .benefits li:before {
                            content: "✓";
                            position: absolute;
                            left: 0;
                            color: #667eea;
                            font-weight: bold;
                            font-size: 18px;
                        }
                        .cta-button {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .cta-button a {
                            display: inline-block;
                            padding: 15px 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 30px;
                            font-weight: 600;
                            font-size: 16px;
                            transition: transform 0.3s ease;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 30px 40px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        .footer p {
                            color: #888888;
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        .footer a {
                            color: #667eea;
                            text-decoration: none;
                        }
                        .social-links {
                            margin-top: 20px;
                        }
                        .social-links a {
                            display: inline-block;
                            margin: 0 10px;
                            color: #667eea;
                            font-size: 24px;
                            text-decoration: none;
                        }
                        @media only screen and (max-width: 600px) {
                            .content {
                                padding: 20px;
                            }
                            .header h1 {
                                font-size: 24px;
                            }
                            .benefits {
                                padding: 15px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>⚖️ Luật Poip </h1>
                            <p>Cập nhật tin tức pháp luật mới nhất</p>
                        </div>

                        <div class="icon-container">
                            <div class="icon">✉️</div>
                        </div>

                        <div class="content">
                            <h2>Chào mừng bạn đã đăng ký!</h2>

                            <p>Xin chào,</p>

                            <p>Cảm ơn bạn đã đăng ký nhận bản tin từ <strong>luật Poip</strong>! Chúng tôi rất vui mừng được đồng hành cùng bạn trong việc cập nhật những thông tin pháp luật mới nhất và hữu ích nhất.</p>

                            <div class="benefits">
                                <h3>📚 Bạn sẽ nhận được:</h3>
                                <ul>
                                    <li>Tin tức pháp luật cập nhật hàng tuần</li>
                                    <li>Phân tích chuyên sâu về các văn bản pháp luật mới</li>
                                    <li>Tư vấn pháp lý từ các chuyên gia</li>
                                    <li>Thông báo về các thay đổi quan trọng trong hệ thống pháp luật</li>
                                    <li>Mẹo và hướng dẫn sử dụng ứng dụng luật Poip hiệu quả</li>
                                </ul>
                            </div>

                            <p>Đăng ký của bạn đã được xác nhận thành công. Bạn sẽ nhận được email đầu tiên trong thời gian sớm nhất.</p>

                            <div class="cta-button">
                                <a href="https://luatpoip.com">Khám phá luật Poip ngay</a>
                            </div>

                            <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                                Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi tại
                                <a href="mailto:luatpoip@gmail.com" style="color: #667eea;">luatpoip@gmail.com</a>
                            </p>
                        </div>

                        <div class="footer">
                            <p><strong>Luật Poip</strong> - Trang hỗ trợ và giải đáp thắc mắc về luật</p>
                            <p>Địa chỉ: 70 Ngách 6 Ngõ 10 Tả Thanh Oai, Đại Thanh, Hà Nội, Việt Nam</p>
                            <p>Email: luatpoip@gmail.com | Hotline: 0868.193.345</p>

                            <div class="social-links">
                                <a href="#" title="Facebook">📘</a>
                                <a href="#" title="Twitter">🐦</a>
                                <a href="#" title="LinkedIn">💼</a>
                            </div>

                            <p style="margin-top: 20px; font-size: 12px;">
                                Bạn nhận được email này vì đã đăng ký nhận tin tức từ luật Poip.<br>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """;

      emailService.sendEmail(email, title, content);
      log.info("Subscribing email: {}", email);
      return "Cảm ơn bạn đã đăng ký nhận tin tức từ luật Poip!";
    } catch (Exception e) {
      log.error("Error subscribing email: {}", e.getMessage());
      throw new RuntimeException("Lỗi hệ thống, vui lòng thử lại sau!");
    }
  }

  @Override
  public List<SubscriberResponse> getAllSubscribers() {
    return customerSubscribeRepository.findAll().stream()
        .map(
            subscriber ->
                SubscriberResponse.builder()
                    .id(subscriber.getId())
                    .email(subscriber.getEmail())
                    .createdAt(subscriber.getCreatedAt())
                    .build())
        .collect(Collectors.toList());
  }

  @Override
  public Boolean deleteSubscriber(String id) {
    customerSubscribeRepository.deleteById(id);
    log.info("Subscriber deleted: {}", id);
    return true;
  }
}

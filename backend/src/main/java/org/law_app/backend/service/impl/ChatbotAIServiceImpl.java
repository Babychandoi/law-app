package org.law_app.backend.service.impl;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.SenderType;
import org.law_app.backend.entity.ChatMessage;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Company;
import org.law_app.backend.entity.Location;
import org.law_app.backend.entity.News;
import org.law_app.backend.entity.PhoneContact;
import org.law_app.backend.entity.Services;
import org.law_app.backend.entity.Social;
import org.law_app.backend.repository.ChatMessageRepository;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.CompanyRepository;
import org.law_app.backend.repository.LocationRepository;
import org.law_app.backend.repository.NewsRepository;
import org.law_app.backend.repository.PhoneContactRepository;
import org.law_app.backend.repository.ServiceRepository;
import org.law_app.backend.repository.SocialRepository;
import org.law_app.backend.service.ChatbotAIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatbotAIServiceImpl implements ChatbotAIService {

  @Value("${ai.chat.provider-name:AI provider}")
  private String aiProviderName;

  @Value("${ai.chat.api.key:}")
  private String aiApiKey;

  @Value("${ai.chat.api.url:}")
  private String aiApiUrl;

  @Value("${ai.chat.api.key-required:true}")
  private boolean aiApiKeyRequired;

  @Value("${ai.chat.model:AI-PRO}")
  private String model;

  @Value("${ai.chat.temperature:0.7}")
  private double temperature;

  @Value("${ai.chat.max-tokens:8192}")
  private int maxTokens;

  @Value("${ai.chat.http-referer:}")
  private String aiHttpReferer;

  @Value("${ai.chat.x-title:}")
  private String aiTitle;

  @Value("${chatbot.enabled:true}")
  private boolean chatbotEnabled;

  // Timeout để lời gọi AI không treo vô hạn (giữ thread + không có backpressure).
  private final RestTemplate restTemplate = buildRestTemplate();

  private static RestTemplate buildRestTemplate() {
    org.springframework.http.client.SimpleClientHttpRequestFactory factory =
        new org.springframework.http.client.SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(5000); // 5s kết nối
    factory.setReadTimeout(30000); // 30s chờ AI trả lời
    return new RestTemplate(factory);
  }

  private final ChatMessageRepository chatMessageRepository;
  private final NewsRepository newsRepository;
  private final ServiceRepository serviceRepository;
  private final SocialRepository socialRepository;
  private final PhoneContactRepository phoneContactRepository;
  private final LocationRepository locationRepository;
  private final CompanyRepository companyRepository;
  private final ChildrenServiceRepository childrenServiceRepository;

  // Track which conversations have admin involvement
  private final Map<String, Boolean> aiEnabledMap = new ConcurrentHashMap<>();

  // Track last admin message time for auto re-enable
  private final Map<String, Long> lastAdminMessageTime = new ConcurrentHashMap<>();

  // Store conversation history for context
  private final Map<String, List<Map<String, String>>> conversationHistory =
      new ConcurrentHashMap<>();

  private static final int MAX_HISTORY_SIZE = 10;

  // Auto re-enable AI after 5 minutes of admin inactivity
  private static final long AUTO_REENABLE_DELAY_MS = 5 * 60 * 1000; // 5 minutes

  private static final String SYSTEM_PROMPT_TEMPLATE =
      "Bạn là một chuyên viên chăm sóc khách hàng của Luật Poip Legal - một công ty luật chuyên nghiệp tại Việt Nam.\n"
          + "Bạn là NGƯỜI THẬT đang trực tiếp nhắn tin với khách, không phải máy hay bot. Hãy xưng \"em\" và gọi khách là \"anh/chị\", nói chuyện tự nhiên, ấm áp, lịch sự như một nhân viên tư vấn có kinh nghiệm.\n\n"
          + "NHIỆM VỤ CỦA BẠN:\n"
          + "1. Trả lời các câu hỏi về dịch vụ pháp lý của công ty\n"
          + "2. Hướng dẫn khách hàng về quy trình tư vấn\n"
          + "3. Cung cấp thông tin liên hệ khi cần\n"
          + "4. Giới thiệu tin tức pháp luật mới nhất\n"
          + "5. Nếu câu hỏi quá phức tạp hoặc cần tư vấn chuyên sâu, hãy đề xuất khách hàng chờ tư vấn viên\n\n"
          + "%s\n\n"
          + // Company info will be inserted here
          "%s\n\n"
          + // Services info will be inserted here
          "%s\n\n"
          + // News info will be inserted here
          "%s\n\n"
          + // Social info will be inserted here
          "%s\n\n"
          + // Contact info will be inserted here
          "BO NHO HOI THOAI:\n"
          + "- Ban duoc cung cap cac tin nhan gan nhat cua cung khach hang trong messages cua request\n"
          + "- Hay dung lich su nay de theo doi thong tin khach da cung cap nhu ten, nhu cau, ma ho so tam, dich vu quan tam\n"
          + "- Neu khach hoi lai thong tin da co trong lich su, hay nhac lai dung thong tin do\n"
          + "- Khong noi rang ban khong the nho neu thong tin dang co trong lich su hoi thoai duoc cung cap\n"
          + "- Khong tu nhan luu tru dai han; chi dung ngu canh hoi thoai hien tai\n\n"
          + "CÁCH TRẢ LỜI:\n"
          + "- Trả lời ngắn gọn, rõ ràng (tối đa 3-4 câu)\n"
          + "- Thân thiện và chuyên nghiệp, viết như đang nhắn tin cho khách, giọng người thật\n"
          + "- Sử dụng tiếng Việt có dấu\n"
          + "- TUYỆT ĐỐI KHÔNG dùng định dạng Markdown: không dùng dấu ** hay * để in đậm/nghiêng, không dùng ###, không dùng dấu gạch đầu dòng (-, •) hay danh sách đánh số. Viết thành câu văn liền mạch tự nhiên.\n"
          + "- Hạn chế tối đa emoji; chỉ dùng khi thật sự tự nhiên, không rải emoji ở mỗi dòng\n"
          + "- Giữ giọng tự nhiên, ấm áp như nhân viên trực chat; không mở đầu bằng câu máy móc kiểu 'Tôi là bot'\n"
          + "- Nếu khách HỎI THẲNG bạn có phải người/AI không, hãy trả lời TRUNG THỰC rằng bạn là trợ lý AI của Luật Poip Legal và có thể mời tư vấn viên hỗ trợ; tuyệt đối không khẳng định mình là con người\n"
          + "- Nếu khách hỏi về dịch vụ cụ thể, hãy giới thiệu dịch vụ đó từ danh sách\n"
          + "- Nếu khách hỏi về tin tức pháp luật, hãy đề cập tin tức liên quan\n"
          + "- Nếu khách hỏi về kênh liên lạc (Facebook, Zalo, etc), hãy cung cấp link từ danh sách\n"
          + "- Nếu khách hỏi về địa chỉ, số điện thoại, hãy cung cấp thông tin từ danh sách\n"
          + "- Luôn kết thúc bằng câu hỏi hoặc lời mời để tiếp tục hỗ trợ\n\n"
          + "LƯU Ý QUAN TRỌNG:\n"
          + "- KHÔNG đưa ra tư vấn pháp lý cụ thể (chỉ tư vấn viên mới làm được)\n"
          + "- KHÔNG cam kết về kết quả hoặc thời gian xử lý\n"
          + "- Nếu không chắc chắn, hãy đề xuất khách hàng chờ tư vấn viên";

  @Override
  public String generateResponse(String guestId, String message) {
    String chatCompletionsUrl = resolveChatCompletionsUrl(aiApiUrl);
    if (!chatbotEnabled
        || !hasText(chatCompletionsUrl)
        || (aiApiKeyRequired && !hasText(aiApiKey))) {
      log.warn("Chatbot is disabled or {} API configuration is incomplete", aiProviderName);
      return null;
    }

    try {
      // Get company data from database
      String companyInfo = getCompanyInfo();
      String servicesInfo = getServicesInfo();
      String newsInfo = getNewsInfo();
      String socialInfo = getSocialInfo();
      String contactInfo = getContactInfo();

      // Build system prompt with real data
      String systemPrompt =
          String.format(
              SYSTEM_PROMPT_TEMPLATE, companyInfo, servicesInfo, newsInfo, socialInfo, contactInfo);

      List<Map<String, String>> history = loadConversationHistory(guestId, message);
      conversationHistory.put(guestId, history);

      // Build messages array for OpenAI-compatible chat completions APIs.
      List<Map<String, String>> messages = new ArrayList<>();

      // Add system prompt
      Map<String, String> systemMessage = new HashMap<>();
      systemMessage.put("role", "system");
      systemMessage.put("content", systemPrompt);
      messages.add(systemMessage);

      // Add conversation history
      messages.addAll(history);

      // Prepare request body for an OpenAI-compatible chat completions API.
      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", model);
      requestBody.put("messages", messages);
      requestBody.put("max_tokens", maxTokens);
      requestBody.put("temperature", temperature);
      requestBody.put("stream", false);

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      if (hasText(aiApiKey)) {
        headers.setBearerAuth(aiApiKey.trim());
      }
      if (hasText(aiHttpReferer)) {
        headers.set("HTTP-Referer", aiHttpReferer.trim());
      }
      if (hasText(aiTitle)) {
        headers.set("X-Title", aiTitle.trim());
      }

      HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

      ResponseEntity<Map> response =
          restTemplate.exchange(chatCompletionsUrl, HttpMethod.POST, request, Map.class);

      if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
        Map<String, Object> responseBody = response.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

        if (choices != null && !choices.isEmpty()) {
          Map<String, Object> firstChoice = choices.get(0);
          Map<String, String> messageContent = (Map<String, String>) firstChoice.get("message");
          String aiResponse = messageContent.get("content");

          // Add AI response to history
          Map<String, String> assistantMessage = new HashMap<>();
          assistantMessage.put("role", "assistant");
          assistantMessage.put("content", aiResponse);
          history.add(assistantMessage);
          conversationHistory.put(guestId, trimHistory(history));

          log.info("AI response generated for guest: {} using {}", guestId, aiProviderName);
          return aiResponse;
        }
      }

      log.error("Failed to get valid response from {} API", aiProviderName);
      return null;

    } catch (Exception e) {
      log.error("Error generating AI response for guest {}: {}", guestId, e.getMessage(), e);
      return null;
    }
  }

  private String resolveChatCompletionsUrl(String configuredUrl) {
    if (!hasText(configuredUrl)) {
      return "";
    }

    String trimmedUrl = configuredUrl.trim();
    String normalizedUrl =
        trimmedUrl.endsWith("/") ? trimmedUrl.substring(0, trimmedUrl.length() - 1) : trimmedUrl;
    if (normalizedUrl.endsWith("/v1")) {
      return normalizedUrl + "/chat/completions";
    }
    return trimmedUrl;
  }

  private boolean hasText(String value) {
    return value != null && !value.trim().isEmpty();
  }

  private List<Map<String, String>> loadConversationHistory(String guestId, String currentMessage) {
    List<Map<String, String>> history = new ArrayList<>();

    if (hasText(guestId)) {
      try {
        List<ChatMessage> persistedMessages =
            chatMessageRepository.findTop20ByGuestIdOrderByCreatedAtDesc(guestId);
        Collections.reverse(persistedMessages);

        for (ChatMessage chatMessage : persistedMessages) {
          Map<String, String> aiMessage = toAiMessage(chatMessage);
          if (aiMessage != null) {
            history.add(aiMessage);
          }
        }
      } catch (Exception e) {
        log.warn("Could not load persisted chat history for guest {}: {}", guestId, e.getMessage());
      }
    }

    if (history.isEmpty() || !latestUserMessageMatches(history, currentMessage)) {
      Map<String, String> userMessage = new HashMap<>();
      userMessage.put("role", "user");
      userMessage.put("content", currentMessage);
      history.add(userMessage);
    }

    return trimHistory(history);
  }

  private Map<String, String> toAiMessage(ChatMessage chatMessage) {
    if (chatMessage == null
        || !hasText(chatMessage.getContent())
        || chatMessage.getSenderType() == null) {
      return null;
    }

    Map<String, String> aiMessage = new HashMap<>();
    aiMessage.put("role", chatMessage.getSenderType() == SenderType.GUEST ? "user" : "assistant");
    aiMessage.put("content", chatMessage.getContent());
    return aiMessage;
  }

  private boolean latestUserMessageMatches(
      List<Map<String, String>> history, String currentMessage) {
    if (history.isEmpty()) {
      return false;
    }

    Map<String, String> lastMessage = history.get(history.size() - 1);
    return "user".equals(lastMessage.get("role"))
        && Objects.equals(lastMessage.get("content"), currentMessage);
  }

  private List<Map<String, String>> trimHistory(List<Map<String, String>> history) {
    int maxMessages = MAX_HISTORY_SIZE * 2;
    if (history.size() <= maxMessages) {
      return new ArrayList<>(history);
    }

    return new ArrayList<>(history.subList(history.size() - maxMessages, history.size()));
  }

  /** Get company information from database */
  private String getCompanyInfo() {
    try {
      List<Company> companies = companyRepository.findAll();

      if (companies.isEmpty()) {
        return "THÔNG TIN CÔNG TY:\n- Tên: Luật Poip Legal\n- Website: https://luatpoip.com";
      }

      Company company = companies.get(0); // Get first company
      StringBuilder sb = new StringBuilder("THÔNG TIN CÔNG TY:\n");

      if (company.getName() != null) {
        sb.append("- Tên: ").append(company.getName()).append("\n");
      }
      if (company.getRepresentative() != null) {
        sb.append("- Người đại diện: ").append(company.getRepresentative()).append("\n");
      }
      if (company.getTaxCode() != null) {
        sb.append("- Mã số thuế: ").append(company.getTaxCode()).append("\n");
      }
      if (company.getEmail() != null) {
        sb.append("- Email: ").append(company.getEmail()).append("\n");
      }
      if (company.getWebsiteName() != null) {
        sb.append("- Website: ").append(company.getWebsiteName()).append("\n");
      }

      return sb.toString();
    } catch (Exception e) {
      log.error("Error fetching company info: {}", e.getMessage());
      return "THÔNG TIN CÔNG TY:\n- Tên: Luật Poip Legal\n- Website: https://luatpoip.com";
    }
  }

  /** Get contact information (phone & location) from database */
  private String getContactInfo() {
    try {
      StringBuilder sb = new StringBuilder("THÔNG TIN LIÊN HỆ:\n");

      // Get phone contacts
      List<PhoneContact> phones = phoneContactRepository.findAll();
      if (!phones.isEmpty()) {
        sb.append("Số điện thoại:\n");
        phones.forEach(
            phone -> {
              if (phone.getLabel() != null && phone.getNumber() != null) {
                sb.append("- ")
                    .append(phone.getLabel())
                    .append(": ")
                    .append(phone.getNumber())
                    .append("\n");
              }
            });
      }

      // Get locations
      List<Location> locations = locationRepository.findAll();
      if (!locations.isEmpty()) {
        sb.append("Địa chỉ:\n");
        locations.forEach(
            location -> {
              if (location.getAddress() != null) {
                String prefix = location.getType() != null ? location.getType() + ": " : "";
                sb.append("- ").append(prefix).append(location.getAddress()).append("\n");
              }
            });
      }

      if (phones.isEmpty() && locations.isEmpty()) {
        return "THÔNG TIN LIÊN HỆ:\n- Hotline: 0868.193.345\n- Địa chỉ: 70 Ngách 6 Ngõ 10 Tả Thanh Oai, Đại Thanh, Hà Nội";
      }

      return sb.toString();
    } catch (Exception e) {
      log.error("Error fetching contact info: {}", e.getMessage());
      return "THÔNG TIN LIÊN HỆ:\n- Hotline: 0868.193.345\n- Địa chỉ: 70 Ngách 6 Ngõ 10 Tả Thanh Oai, Đại Thanh, Hà Nội";
    }
  }

  /** Get services information from database */
  private String getServicesInfo() {
    try {
      List<Services> services = serviceRepository.findAll();
      List<ChildrenServices> childrenServices = childrenServiceRepository.findAll();

      if (services.isEmpty() && childrenServices.isEmpty()) {
        return "DỊCH VỤ CHÍNH:\n- Tư vấn sở hữu trí tuệ\n- Đăng ký thương hiệu\n- Đăng ký bản quyền\n- Đăng ký bằng sáng chế";
      }

      StringBuilder sb = new StringBuilder("DỊCH VỤ:\n");

      // Add main services
      if (!services.isEmpty()) {
        sb.append("Dịch vụ chính:\n");
        services.stream()
            .limit(10)
            .forEach(
                service -> {
                  sb.append("- ").append(service.getTitle());
                  if (service.getHref() != null && !service.getHref().isEmpty()) {
                    sb.append(" (").append(service.getHref()).append(")");
                  }
                  sb.append("\n");
                });
      }

      // Add children services
      if (!childrenServices.isEmpty()) {
        sb.append("\nDịch vụ chi tiết:\n");
        childrenServices.stream()
            .limit(20)
            .forEach(
                childService -> {
                  sb.append("- ").append(childService.getTitle());
                  if (childService.getDescription() != null
                      && !childService.getDescription().isEmpty()) {
                    String desc = childService.getDescription();
                    if (desc.length() > 100) {
                      desc = desc.substring(0, 100) + "...";
                    }
                    sb.append(": ").append(desc);
                  }
                  sb.append("\n");
                });
      }

      return sb.toString();
    } catch (Exception e) {
      log.error("Error fetching services info: {}", e.getMessage());
      return "DỊCH VỤ CHÍNH:\n- Tư vấn sở hữu trí tuệ\n- Đăng ký thương hiệu";
    }
  }

  /** Get latest news from database */
  private String getNewsInfo() {
    try {
      List<News> newsList = newsRepository.findAll();

      if (newsList.isEmpty()) {
        return "TIN TỨC MỚI NHẤT:\n- Cập nhật thường xuyên về pháp luật sở hữu trí tuệ";
      }

      // Get 5 most recent news
      List<News> recentNews =
          newsList.stream()
              .sorted(
                  (a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                  })
              .limit(5)
              .collect(Collectors.toList());

      StringBuilder sb = new StringBuilder("TIN TỨC MỚI NHẤT:\n");
      recentNews.forEach(
          news -> {
            sb.append("- ").append(news.getTitle());
            if (news.getSubtitle() != null && !news.getSubtitle().isEmpty()) {
              String subtitle = news.getSubtitle();
              if (subtitle.length() > 80) {
                subtitle = subtitle.substring(0, 80) + "...";
              }
              sb.append(": ").append(subtitle);
            }
            sb.append("\n");
          });

      return sb.toString();
    } catch (Exception e) {
      log.error("Error fetching news info: {}", e.getMessage());
      return "TIN TỨC MỚI NHẤT:\n- Cập nhật thường xuyên về pháp luật";
    }
  }

  /** Get social media information from database */
  private String getSocialInfo() {
    try {
      List<Social> socials = socialRepository.findAll();

      if (socials.isEmpty()) {
        return "KÊNH MẠNG XÃ HỘI:\n- Liên hệ qua Hotline hoặc Email";
      }

      StringBuilder sb = new StringBuilder("KÊNH MẠNG XÃ HỘI:\n");

      socials.forEach(
          social -> {
            if (social.getLabel() != null && social.getHref() != null) {
              sb.append("- ")
                  .append(social.getLabel())
                  .append(": ")
                  .append(social.getHref())
                  .append("\n");
            }
          });

      return sb.toString();
    } catch (Exception e) {
      log.error("Error fetching social info: {}", e.getMessage());
      return "KÊNH MẠNG XÃ HỘI:\n- Liên hệ qua Hotline hoặc Email";
    }
  }

  @Override
  public boolean shouldAIRespond(String guestId) {
    if (!chatbotEnabled) {
      return false;
    }

    // Check if AI is explicitly disabled for this guest
    Boolean aiEnabled = aiEnabledMap.get(guestId);

    // If AI was disabled by admin, check if enough time has passed to re-enable
    if (aiEnabled != null && !aiEnabled) {
      Long lastAdminTime = lastAdminMessageTime.get(guestId);

      if (lastAdminTime != null) {
        long timeSinceLastAdmin = System.currentTimeMillis() - lastAdminTime;

        // Auto re-enable AI after AUTO_REENABLE_DELAY_MS of admin inactivity
        if (timeSinceLastAdmin > AUTO_REENABLE_DELAY_MS) {
          log.info(
              "Auto re-enabling AI for guest {} after {} minutes of admin inactivity",
              guestId,
              AUTO_REENABLE_DELAY_MS / 60000);
          aiEnabledMap.put(guestId, true);
          lastAdminMessageTime.remove(guestId);
          return true;
        }
      }

      return false;
    }

    // AI responds by default unless admin has taken over
    return aiEnabledMap.getOrDefault(guestId, true);
  }

  @Override
  public void disableAIForGuest(String guestId) {
    aiEnabledMap.put(guestId, false);
    lastAdminMessageTime.put(guestId, System.currentTimeMillis());
    log.info("AI disabled for guest: {} at {}", guestId, System.currentTimeMillis());
  }

  @Override
  public void enableAIForGuest(String guestId) {
    aiEnabledMap.put(guestId, true);
    log.info("AI enabled for guest: {}", guestId);
  }

  /** Clear conversation history for a guest */
  public void clearHistory(String guestId) {
    conversationHistory.remove(guestId);
    log.info("Conversation history cleared for guest: {}", guestId);
  }
}

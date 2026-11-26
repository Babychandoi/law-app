package org.law_app.crm.service;

import static org.law_app.crm.service.CrmSupport.hasText;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses and normalizes bracketed landing-page / website lead descriptions such as: {@code [Nguồn:
 * LP-tong-dich-vu-ads] [Đối tượng: Cá nhân] [Dịch vụ: Bảo hộ kiểu dáng công nghiệp] Kiếm tiền
 * [Chiến dịch: utm_source=facebook; utm_medium=paid_social; utm_campaign=poip_nhan_hieu_toan_quoc;
 * utm_content=nh01_tracuu; utm_term=120252505886800047]} into clean Vietnamese text, canonical CRM
 * leadSource, service groups, and tags.
 */
public final class CrmLeadDescriptionNormalizer {

  private static final Pattern BRACKET_TAG_PATTERN =
      Pattern.compile("\\[([^:\\[\\]]+?)\\s*:\\s*([^\\[\\]]*?)\\]");

  private CrmLeadDescriptionNormalizer() {}

  public record NormalizedLeadIntake(
      String normalizedDemandDetail,
      String customerNote,
      String landingSource,
      String customerType,
      String serviceName,
      String channelLabel,
      String campaignName,
      String adContent,
      String adTerm,
      String suggestedLeadSource,
      List<String> suggestedServiceGroups,
      List<String> suggestedTags,
      boolean structured) {}

  public static boolean hasRawBracketMetadata(String raw) {
    if (!hasText(raw)) {
      return false;
    }
    Matcher matcher = BRACKET_TAG_PATTERN.matcher(raw);
    while (matcher.find()) {
      String key = normalizeKey(matcher.group(1));
      if (key.equals("nguồn")
          || key.equals("nguon")
          || key.equals("đối tượng")
          || key.equals("doi tuong")
          || key.equals("dịch vụ")
          || key.equals("dich vu")
          || key.equals("chiến dịch")
          || key.equals("chien dich")) {
        return true;
      }
    }
    return false;
  }

  public static NormalizedLeadIntake normalize(String rawDescription, String fallbackServiceName) {
    Set<String> serviceGroups = new LinkedHashSet<>();
    if (hasText(fallbackServiceName)) {
      addMappedServiceGroups(serviceGroups, fallbackServiceName.trim());
    }

    if (!hasText(rawDescription)) {
      String cleanSvc = hasText(fallbackServiceName) ? fallbackServiceName.trim() : null;
      return new NormalizedLeadIntake(
          cleanSvc != null ? "Dịch vụ quan tâm: " + cleanSvc : null,
          null,
          null,
          null,
          cleanSvc,
          null,
          null,
          null,
          null,
          "6/ Website",
          List.copyOf(serviceGroups),
          List.of(),
          false);
    }

    String trimmedRaw = rawDescription.trim();
    if (!hasRawBracketMetadata(trimmedRaw)) {
      return new NormalizedLeadIntake(
          trimmedRaw,
          trimmedRaw,
          null,
          null,
          hasText(fallbackServiceName) ? fallbackServiceName.trim() : null,
          null,
          null,
          null,
          null,
          "6/ Website",
          List.copyOf(serviceGroups),
          List.of(),
          false);
    }

    String landingSource = null;
    String customerType = null;
    String serviceName = null;
    String rawCampaign = null;
    Map<String, String> extraPairs = new LinkedHashMap<>();

    Matcher matcher = BRACKET_TAG_PATTERN.matcher(trimmedRaw);
    StringBuilder remainder = new StringBuilder();
    int lastEnd = 0;
    while (matcher.find()) {
      remainder.append(trimmedRaw, lastEnd, matcher.start()).append(' ');
      lastEnd = matcher.end();

      String rawKey = matcher.group(1).trim();
      String rawVal = matcher.group(2).trim();
      if (!hasText(rawVal)) {
        continue;
      }
      String key = normalizeKey(rawKey);
      switch (key) {
        case "nguồn", "nguon" -> landingSource = cleanLandingSource(rawVal);
        case "đối tượng", "doi tuong" -> customerType = rawVal;
        case "dịch vụ", "dich vu" -> serviceName = rawVal;
        case "chiến dịch", "chien dich" -> rawCampaign = rawVal;
        default -> extraPairs.put(rawKey, rawVal);
      }
    }
    remainder.append(trimmedRaw.substring(lastEnd));

    String customerNote = remainder.toString().replaceAll("\\s+", " ").trim();
    if ("Chưa xác định".equalsIgnoreCase(serviceName)) {
      serviceName = null;
    }
    if (!hasText(serviceName) && hasText(fallbackServiceName)) {
      serviceName = fallbackServiceName.trim();
    }
    if (hasText(serviceName)) {
      addMappedServiceGroups(serviceGroups, serviceName);
    }

    Map<String, String> utm = parseCampaignParams(rawCampaign);
    String utmSource = utm.get("utm_source");
    String utmMedium = utm.get("utm_medium");
    String utmCampaign = utm.get("utm_campaign");
    String utmContent = utm.get("utm_content");
    String utmTerm = utm.get("utm_term");

    boolean isPaidAds = isAdvertisingTraffic(landingSource, utmSource, utmMedium, utmCampaign);
    String suggestedLeadSource = isPaidAds ? "1/ Quảng cáo" : "6/ Website";
    String channelLabel = formatChannelLabel(utmSource, utmMedium, landingSource, isPaidAds);

    Set<String> tags = new LinkedHashSet<>();
    String channelTag = formatChannelShortTag(utmSource, landingSource, isPaidAds);
    if (hasText(channelTag)) {
      tags.add(channelTag);
    }
    if (hasText(customerType)) {
      tags.add(customerType);
    }

    List<String> lines = new ArrayList<>();
    if (hasText(customerNote)) {
      lines.add("Nội dung KH: " + customerNote);
    } else if (hasText(serviceName)) {
      lines.add(
          "Tư vấn: " + serviceName + (hasText(customerType) ? " (" + customerType + ")" : ""));
    }

    if (hasText(serviceName) && hasText(customerNote)) {
      lines.add("Dịch vụ quan tâm: " + serviceName);
    }
    if (hasText(customerType) && (hasText(customerNote) || !hasText(serviceName))) {
      lines.add("Đối tượng: " + customerType);
    }

    List<String> sourceParts = new ArrayList<>();
    if (hasText(channelLabel)) {
      sourceParts.add("Kênh: " + channelLabel);
    }
    if (hasText(landingSource)) {
      sourceParts.add("Trang đích: " + landingSource);
    }
    if (!sourceParts.isEmpty()) {
      lines.add(String.join(" · ", sourceParts));
    }

    List<String> campaignParts = new ArrayList<>();
    if (hasText(utmCampaign)) {
      campaignParts.add("Chiến dịch: " + humanizeSlug(utmCampaign));
    }
    if (hasText(utmContent)) {
      campaignParts.add("Mẫu QC: " + utmContent);
    }
    if (hasText(utmTerm)) {
      campaignParts.add("Mã nhóm QC: " + utmTerm);
    }
    if (!campaignParts.isEmpty()) {
      lines.add(String.join(" · ", campaignParts));
    } else if (hasText(rawCampaign) && utm.isEmpty()) {
      lines.add("Chiến dịch: " + rawCampaign);
    }

    extraPairs.forEach((k, v) -> lines.add(k + ": " + v));

    String normalizedText = String.join("\n", lines).trim();
    return new NormalizedLeadIntake(
        hasText(normalizedText) ? normalizedText : trimmedRaw,
        hasText(customerNote) ? customerNote : null,
        landingSource,
        customerType,
        serviceName,
        channelLabel,
        utmCampaign,
        utmContent,
        utmTerm,
        suggestedLeadSource,
        List.copyOf(serviceGroups),
        List.copyOf(tags),
        true);
  }

  private static String normalizeKey(String rawKey) {
    return rawKey == null ? "" : rawKey.trim().toLowerCase(Locale.ROOT);
  }

  private static String cleanLandingSource(String rawVal) {
    String cleaned = rawVal.trim();
    if (cleaned.regionMatches(true, 0, "LP ", 0, 3)) {
      return "LP-" + cleaned.substring(3).trim();
    }
    return cleaned;
  }

  private static Map<String, String> parseCampaignParams(String rawCampaign) {
    Map<String, String> map = new LinkedHashMap<>();
    if (!hasText(rawCampaign)) {
      return map;
    }
    String[] tokens = rawCampaign.split("[;&]");
    for (String token : tokens) {
      int eq = token.indexOf('=');
      if (eq <= 0) {
        continue;
      }
      String k = token.substring(0, eq).trim().toLowerCase(Locale.ROOT);
      String v = token.substring(eq + 1).trim();
      if (hasText(k) && hasText(v)) {
        map.put(k, v);
      }
    }
    return map;
  }

  private static boolean isAdvertisingTraffic(
      String landingSource, String utmSource, String utmMedium, String utmCampaign) {
    if (hasText(utmCampaign)) {
      return true;
    }
    if (hasText(utmMedium)) {
      String m = utmMedium.toLowerCase(Locale.ROOT);
      if (m.contains("paid") || m.contains("cpc") || m.contains("cpm") || m.contains("ads")) {
        return true;
      }
    }
    if (hasText(landingSource)) {
      String s = landingSource.toLowerCase(Locale.ROOT);
      if (s.endsWith("-ads") || s.contains("-ads-") || s.startsWith("ads-")) {
        return true;
      }
    }
    if (hasText(utmSource)) {
      String src = utmSource.toLowerCase(Locale.ROOT);
      return src.contains("ads") || src.equals("fb") || src.equals("facebook");
    }
    return false;
  }

  private static String formatChannelLabel(
      String utmSource, String utmMedium, String landingSource, boolean isPaidAds) {
    String platform = null;
    if (hasText(utmSource)) {
      String s = utmSource.trim().toLowerCase(Locale.ROOT);
      platform =
          switch (s) {
            case "facebook", "fb", "meta", "ig", "instagram" ->
                isPaidAds ? "Facebook Ads" : "Facebook";
            case "google", "gg", "adwords" -> isPaidAds ? "Google Ads" : "Google";
            case "tiktok", "tt" -> isPaidAds ? "TikTok Ads" : "TikTok";
            case "zalo" -> isPaidAds ? "Zalo Ads" : "Zalo";
            default -> utmSource.trim();
          };
    } else if (isPaidAds && hasText(landingSource)) {
      platform = "Landing Page Ads";
    }

    String mediumLabel = null;
    if (hasText(utmMedium)) {
      String m = utmMedium.trim().toLowerCase(Locale.ROOT);
      mediumLabel =
          switch (m) {
            case "paid_social", "paidsocial" -> "Paid Social";
            case "cpc", "ppc", "paid_search" -> "Paid Search / CPC";
            case "display", "cpm" -> "Display";
            case "organic" -> "Tự nhiên";
            default -> utmMedium.trim();
          };
    }

    if (hasText(platform) && hasText(mediumLabel)) {
      return platform + " (" + mediumLabel + ")";
    }
    return hasText(platform) ? platform : mediumLabel;
  }

  private static String formatChannelShortTag(
      String utmSource, String landingSource, boolean isPaidAds) {
    if (hasText(utmSource)) {
      String s = utmSource.trim().toLowerCase(Locale.ROOT);
      return switch (s) {
        case "facebook", "fb", "meta", "ig", "instagram" -> "Facebook Ads";
        case "google", "gg", "adwords" -> "Google Ads";
        case "tiktok", "tt" -> "TikTok Ads";
        case "zalo" -> isPaidAds ? "Zalo Ads" : "Zalo";
        default -> isPaidAds ? "Quảng cáo" : null;
      };
    }
    if (hasText(landingSource) && landingSource.toUpperCase(Locale.ROOT).startsWith("LP")) {
      return isPaidAds ? "Landing Page Ads" : "Landing Page";
    }
    return null;
  }

  private static String humanizeSlug(String slug) {
    if (!hasText(slug)) {
      return "";
    }
    return slug.trim();
  }

  static void addMappedServiceGroups(Set<String> target, String serviceText) {
    if (!hasText(serviceText)) {
      return;
    }
    String clean = serviceText.trim();
    String lower = clean.toLowerCase(Locale.ROOT);

    if (lower.contains("nhãn hiệu")
        || lower.contains("bản quyền")
        || lower.contains("kiểu dáng")
        || lower.contains("sáng chế")
        || lower.contains("sở hữu trí tuệ")
        || lower.contains("mã số mã vạch")) {
      target.add("Sở hữu trí tuệ");
    } else if (lower.contains("doanh nghiệp")
        || lower.contains("thành lập")
        || lower.contains("đkkd")
        || lower.contains("kinh doanh")
        || lower.contains("tạm ngừng")
        || lower.contains("giải thể")
        || lower.contains("đầu tư")) {
      target.add("Doanh nghiệp");
    } else if (lower.contains("website")
        || lower.contains("thương mại điện tử")
        || lower.contains("nền tảng")
        || lower.contains("bộ công thương")) {
      target.add("Website");
    } else if (lower.contains("giấy phép")
        || lower.contains("an toàn thực phẩm")
        || lower.contains("attp")
        || lower.contains("công bố")
        || lower.contains("mỹ phẩm")
        || lower.contains("thực phẩm")) {
      target.add("Giấy phép");
    } else if (lower.contains("tư vấn")
        || lower.contains("hợp đồng")
        || lower.contains("pháp chế")) {
      target.add("Tư vấn pháp lý");
    }

    target.add(clean);
  }
}

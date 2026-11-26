export interface ParsedLeadDemand {
  structured: boolean;
  /** Dòng tiêu đề ngắn gọn cho bảng danh sách (ưu tiên lời nhắn thật của KH). */
  headline: string;
  /** Dòng phụ ngắn gọn cho bảng danh sách (Đối tượng · Kênh · Chiến dịch). */
  subline: string;
  customerNote: string;
  serviceName: string;
  customerType: string;
  landingSource: string;
  channelLabel: string;
  campaignName: string;
  adContent: string;
  adTerm: string;
  normalizedText: string;
}

const BRACKET_TAG_RE = /\[([^:[\]]+?)\s*:\s*([^[\]]*?)\]/g;

function cleanLandingSource(raw: string): string {
  const trimmed = raw.trim();
  if (/^lp\s+/i.test(trimmed)) {
    return `LP-${trimmed.replace(/^lp\s+/i, '').trim()}`;
  }
  return trimmed;
}

function parseUtmMap(rawCampaign: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!rawCampaign.trim()) return out;
  rawCampaign.split(/[;&]/).forEach((part) => {
    const eqIdx = part.indexOf('=');
    if (eqIdx <= 0) return;
    const key = part.slice(0, eqIdx).trim().toLowerCase();
    const val = part.slice(eqIdx + 1).trim();
    if (key && val) out[key] = val;
  });
  return out;
}

function resolveChannelLabel(
  utmSource: string,
  utmMedium: string,
  landingSource: string,
  utmCampaign: string
): string {
  const isPaid =
    Boolean(utmCampaign) ||
    /paid|cpc|cpm|ads/i.test(utmMedium) ||
    /-ads($|-)|^ads-/i.test(landingSource) ||
    /^(fb|facebook)$/i.test(utmSource);

  let platform = '';
  const srcLower = utmSource.toLowerCase();
  if (['facebook', 'fb', 'meta', 'ig', 'instagram'].includes(srcLower)) {
    platform = isPaid ? 'Facebook Ads' : 'Facebook';
  } else if (['google', 'gg', 'adwords'].includes(srcLower)) {
    platform = isPaid ? 'Google Ads' : 'Google';
  } else if (['tiktok', 'tt'].includes(srcLower)) {
    platform = isPaid ? 'TikTok Ads' : 'TikTok';
  } else if (srcLower === 'zalo') {
    platform = isPaid ? 'Zalo Ads' : 'Zalo';
  } else if (utmSource) {
    platform = utmSource;
  } else if (isPaid && landingSource) {
    platform = 'Landing Page Ads';
  }

  let medium = '';
  const medLower = utmMedium.toLowerCase();
  if (medLower === 'paid_social' || medLower === 'paidsocial') {
    medium = 'Paid Social';
  } else if (['cpc', 'ppc', 'paid_search'].includes(medLower)) {
    medium = 'Paid Search / CPC';
  } else if (medLower === 'display' || medLower === 'cpm') {
    medium = 'Display';
  } else if (medLower === 'organic') {
    medium = 'Tự nhiên';
  } else if (utmMedium) {
    medium = utmMedium;
  }

  if (platform && medium) return `${platform} (${medium})`;
  return platform || medium;
}

/**
 * Chuẩn hóa chuỗi mô tả nhu cầu KH từ cả 2 định dạng:
 * 1. Định dạng thô từ Landing Page / Website:
 *    `[Nguồn: LP-tong-dich-vu-ads] [Đối tượng: Cá nhân] [Dịch vụ: ...] Kiếm tiền [Chiến dịch: utm_...]`
 * 2. Định dạng nhiều dòng đã chuẩn hóa từ Backend `CrmLeadDescriptionNormalizer`:
 *    `Nội dung KH: ...\nDịch vụ quan tâm: ...\nĐối tượng: ...\nKênh: ... · Trang đích: ...`
 */
export function parseLeadDemandDetail(raw?: string | null): ParsedLeadDemand {
  const empty: ParsedLeadDemand = {
    structured: false,
    headline: '',
    subline: '',
    customerNote: '',
    serviceName: '',
    customerType: '',
    landingSource: '',
    channelLabel: '',
    campaignName: '',
    adContent: '',
    adTerm: '',
    normalizedText: '',
  };

  if (!raw || !raw.trim()) {
    return empty;
  }

  const trimmed = raw.trim();

  // Trường hợp 1: Chuỗi thô còn chứa thẻ vuông [Nguồn: ...] / [Đối tượng: ...] / [Chiến dịch: ...]
  BRACKET_TAG_RE.lastIndex = 0;
  const bracketMatches = Array.from(trimmed.matchAll(BRACKET_TAG_RE));
  const hasKnownBracket = bracketMatches.some((m) =>
    /^(nguồn|nguon|đối tượng|doi tuong|dịch vụ|dich vu|chiến dịch|chien dich)$/i.test(m[1].trim())
  );

  if (hasKnownBracket) {
    let landingSource = '';
    let customerType = '';
    let serviceName = '';
    let rawCampaign = '';
    const extras: string[] = [];

    let remainder = '';
    let lastIdx = 0;
    bracketMatches.forEach((m) => {
      const start = m.index ?? 0;
      remainder += `${trimmed.slice(lastIdx, start)} `;
      lastIdx = start + m[0].length;

      const k = m[1].trim();
      const v = m[2].trim();
      if (!v) return;
      const lowerK = k.toLowerCase();
      if (lowerK === 'nguồn' || lowerK === 'nguon') {
        landingSource = cleanLandingSource(v);
      } else if (lowerK === 'đối tượng' || lowerK === 'doi tuong') {
        customerType = v;
      } else if (lowerK === 'dịch vụ' || lowerK === 'dich vu') {
        if (v.toLowerCase() !== 'chưa xác định') serviceName = v;
      } else if (lowerK === 'chiến dịch' || lowerK === 'chien dich') {
        rawCampaign = v;
      } else {
        extras.push(`${k}: ${v}`);
      }
    });
    remainder += trimmed.slice(lastIdx);

    const customerNote = remainder.replace(/\s+/g, ' ').trim();
    const utm = parseUtmMap(rawCampaign);
    const channelLabel = resolveChannelLabel(
      utm.utm_source || '',
      utm.utm_medium || '',
      landingSource,
      utm.utm_campaign || ''
    );
    const campaignName = utm.utm_campaign || (!Object.keys(utm).length ? rawCampaign : '');
    const adContent = utm.utm_content || '';
    const adTerm = utm.utm_term || '';

    const headline =
      customerNote ||
      (serviceName
        ? `Tư vấn: ${serviceName}${customerType ? ` (${customerType})` : ''}`
        : landingSource || trimmed);

    const subParts = [
      customerNote && serviceName ? serviceName : '',
      customerType,
      channelLabel || landingSource,
      campaignName,
    ].filter(Boolean);

    const lines: string[] = [];
    if (customerNote) {
      lines.push(`Nội dung KH: ${customerNote}`);
    } else if (serviceName) {
      lines.push(`Tư vấn: ${serviceName}${customerType ? ` (${customerType})` : ''}`);
    }
    if (serviceName && customerNote) lines.push(`Dịch vụ quan tâm: ${serviceName}`);
    if (customerType && (customerNote || !serviceName)) lines.push(`Đối tượng: ${customerType}`);

    const srcLine = [
      channelLabel ? `Kênh: ${channelLabel}` : '',
      landingSource ? `Trang đích: ${landingSource}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    if (srcLine) lines.push(srcLine);

    const campLine = [
      campaignName ? `Chiến dịch: ${campaignName}` : '',
      adContent ? `Mẫu QC: ${adContent}` : '',
      adTerm ? `Mã nhóm QC: ${adTerm}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    if (campLine) lines.push(campLine);
    extras.forEach((ex) => lines.push(ex));

    return {
      structured: true,
      headline,
      subline: subParts.join(' · '),
      customerNote,
      serviceName,
      customerType,
      landingSource,
      channelLabel,
      campaignName,
      adContent,
      adTerm,
      normalizedText: lines.join('\n') || trimmed,
    };
  }

  // Trường hợp 2: Chuỗi nhiều dòng đã chuẩn hóa từ Backend CrmLeadDescriptionNormalizer
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const looksNormalized = lines.some((l) =>
    /^(Nội dung KH:|Tư vấn:|Dịch vụ quan tâm:|Đối tượng:|Kênh:|Trang đích:|Chiến dịch:)/.test(l)
  );

  if (looksNormalized) {
    let customerNote = '';
    let serviceName = '';
    let customerType = '';
    let landingSource = '';
    let channelLabel = '';
    let campaignName = '';
    let adContent = '';
    let adTerm = '';
    let consultFallback = '';

    lines.forEach((line) => {
      const segments = line.split(/\s*·\s*/);
      segments.forEach((seg) => {
        const colon = seg.indexOf(':');
        if (colon <= 0) return;
        const label = seg.slice(0, colon).trim();
        const val = seg.slice(colon + 1).trim();
        if (!val) return;
        switch (label) {
          case 'Nội dung KH':
            customerNote = val;
            break;
          case 'Tư vấn':
            consultFallback = val;
            break;
          case 'Dịch vụ quan tâm':
            serviceName = val;
            break;
          case 'Đối tượng':
            customerType = val;
            break;
          case 'Kênh':
            channelLabel = val;
            break;
          case 'Trang đích':
            landingSource = val;
            break;
          case 'Chiến dịch':
            campaignName = val;
            break;
          case 'Mẫu QC':
            adContent = val;
            break;
          case 'Mã nhóm QC':
            adTerm = val;
            break;
          default:
            break;
        }
      });
    });

    const headline = customerNote || (consultFallback ? `Tư vấn: ${consultFallback}` : lines[0]);
    const subParts = [
      customerNote && serviceName ? serviceName : '',
      customerType,
      channelLabel || landingSource,
      campaignName,
    ].filter(Boolean);

    return {
      structured: true,
      headline,
      subline: subParts.join(' · '),
      customerNote,
      serviceName,
      customerType,
      landingSource,
      channelLabel,
      campaignName,
      adContent,
      adTerm,
      normalizedText: trimmed,
    };
  }

  // Trường hợp 3: Văn bản ghi chú thông thường của chuyên viên
  return {
    ...empty,
    headline: lines[0] || trimmed,
    subline: lines.length > 1 ? lines.slice(1).join(' · ') : '',
    customerNote: trimmed,
    normalizedText: trimmed,
  };
}

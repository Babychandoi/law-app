// Tracking conversion cho landing page ads.
// Điền ID pixel thật vào đây (hoặc đặt qua biến môi trường REACT_APP_*).

/**
 * ID thẻ Google Ads — phải trùng với `gtag('config', ...)` trong public/index.html.
 * Đổi tài khoản Ads thì sửa cả hai chỗ.
 */
export const GOOGLE_ADS_ID = 'AW-18319389912';

/**
 * Báo một lượt tải trang cho Google Ads, dùng cho hành động chuyển đổi kiểu "Tải trang".
 *
 * Bắt buộc phải gọi tay: đây là SPA, Google Ads chỉ nhận được lượt xem trang duy nhất lúc trình
 * duyệt tải cứng trang đầu tiên. Điều hướng nội bộ của React chỉ gửi page_view sang GA4
 * (xem shared/analytics/pageview.ts), nên nếu không có hàm này thì hành động "Tải trang" trỏ vào
 * /cam-on sẽ không bao giờ nhận được tín hiệu và nằm im ở trạng thái Không hoạt động.
 */
export const trackAdsPageView = (): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GOOGLE_ADS_ID, {
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
};

export const TRACKING = {
  // Google Ads — NHÃN HÀNH ĐỘNG CHUYỂN ĐỔI, dạng 'AW-18319389912/AbC-dEfGhIjK'.
  // Lấy ở Google Ads > Mục tiêu > Chuyển đổi > Hành động chuyển đổi (không phải ID thẻ trần).
  // Để trống thì không bắn chuyển đổi nào — chủ ý, vì bắn nhầm về nhãn của tài khoản cũ
  // AW-17438859267 sẽ làm số liệu tài khoản mới sai mà không ai phát hiện.
  googleAdsConversionId: process.env.REACT_APP_GOOGLE_ADS_CONVERSION_LABEL || '',
  // Dán Pixel ID Facebook vào đây (vd '1234567890')
  facebookPixelId: process.env.REACT_APP_FB_PIXEL_ID || '',
  // Dán Pixel ID TikTok vào đây (vd 'CXXXXXXXXXXXX')
  tiktokPixelId: process.env.REACT_APP_TIKTOK_PIXEL_ID || '',
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, data?: unknown) => void; page: () => void };
  }
}

/** Nạp Facebook Pixel (chỉ 1 lần) */
export const initFacebookPixel = (): void => {
  const id = TRACKING.facebookPixelId;
  if (!id || window.fbq) return;
  /* eslint-disable */
  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode && s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq = window.fbq as any;
  if (fbq) {
    fbq('init', id);
    fbq('track', 'PageView');
  }
};

/** Nạp TikTok Pixel (chỉ 1 lần) */
export const initTiktokPixel = (): void => {
  const id = TRACKING.tiktokPixelId;
  if (!id || window.ttq) return;
  /* eslint-disable */
  (function (w: any, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
    ];
    ttq.setAndDefer = function (e: any, n: any) {
      e[n] = function () {
        e.push([n].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.load = function (e: any) {
      var n = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = n;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      var o = d.createElement('script');
      o.type = 'text/javascript';
      o.async = !0;
      o.src = n + '?sdkid=' + e + '&lib=' + t;
      var a = d.getElementsByTagName('script')[0];
      a.parentNode && a.parentNode.insertBefore(o, a);
    };
    ttq.load(id);
    ttq.page();
  })(window, document, 'ttq');
  /* eslint-enable */
};

/** Khởi tạo tất cả pixel khi vào landing page */
export const initLandingTracking = (): void => {
  initFacebookPixel();
  initTiktokPixel();
};

/** Bắn sự kiện Lead khi khách gửi form / bấm gọi */
export const trackLead = (source: string): void => {
  // Google Ads conversion
  if (window.gtag && TRACKING.googleAdsConversionId) {
    window.gtag('event', 'conversion', {
      send_to: TRACKING.googleAdsConversionId,
      value: 1.0,
      currency: 'VND',
    });
  }
  // Facebook
  window.fbq?.('track', 'Lead', { content_name: source });
  // TikTok
  window.ttq?.track('SubmitForm', { content_name: source });
};

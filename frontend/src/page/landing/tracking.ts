// Tracking conversion cho landing page ads.
// Điền ID pixel thật vào đây (hoặc đặt qua biến môi trường REACT_APP_*).

export const TRACKING = {
  // Google Ads — đã dùng sẵn trong dự án
  googleAdsConversionId: 'AW-17438859267/9CUZCKWNmoAbEIPAv_tA',
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
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
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

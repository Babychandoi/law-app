(() => {
  'use strict';

  const CONFIG = {
    apiBaseUrl: 'https://api.luatpoip.com',
    servicesPath: '/services/home',
    leadPath: '/customer',
    // Nhãn hành động chuyển đổi Google Ads, dạng 'AW-18319389912/AbC-dEfGhIjK'.
    // Lấy ở Google Ads > Mục tiêu > Chuyển đổi > Hành động chuyển đổi. ĐỂ TRỐNG thì không bắn
    // chuyển đổi kiểu sự kiện — cố ý, vì trang cảm ơn /cam-on đã báo lượt tải trang cho Ads rồi,
    // bật cả hai là một lead bị đếm hai lần.
    googleAdsConversion: '',
    thankYouPath: '/cam-on',
    source: 'LP-tong-dich-vu-ads',
    phone: '0947600064',
    email: 'luatpoip@gmail.com',
  };

  /**
   * Khớp thẻ dịch vụ trên trang với dịch vụ thật trong DB theo `href` — slug ổn định, do admin đặt
   * và gần như không đổi.
   *
   * Trước đây khớp bằng chuỗi con của TÊN dịch vụ ('nhan hieu', 'ban quyen'...). Cách đó vỡ ngay
   * khi admin sửa tên dịch vụ, và vỡ trong im lặng: lead vẫn gửi được nhưng gán sang dịch vụ khác.
   */
  const SERVICE_HREFS = {
    trademark: '/dang-ky-bao-ho-nhan-hieu',
    copyright: '/dang-ky-bao-ho-ban-quyen',
    design: '/bao-ho-kieu-dang-cong-nghiep',
    infringement: '/xu-ly-xam-pham',
    barcode: '/ma-so-ma-vach',
    social: '/dang-ky-giay-phep-mang-xa-hoi',
    contract: '/tu-van-soan-thao-hop-dong',
    ecommerce: '/thong-bao-nen-tang-thuong-mai-dien-tu',
    business: '/thanh-lap-doanh-nghiep-ho-kinh-doanh',
    patent: '/dang-ky-sang-che',
    renewal: '/gia-han-chuyen-nhuong-van-bang',
    science: '/doanh-nghiep-khoa-hoc-cong-nghe',
    corporate: '/tu-van-phap-ly-doanh-nghiep',
  };

  /** Nhãn hiển thị trong dropdown, dùng lại câu chữ marketing thay vì tên thô trong DB. */
  const SERVICE_LABELS = {
    trademark: 'Đăng ký nhãn hiệu',
    copyright: 'Đăng ký bản quyền tác giả',
    design: 'Bảo hộ kiểu dáng công nghiệp',
    infringement: 'Xử lý xâm phạm SHTT',
    barcode: 'Đăng ký mã số mã vạch',
    social: 'Giấy phép mạng xã hội',
    contract: 'Tư vấn, soạn thảo hợp đồng',
    ecommerce: 'Website / nền tảng thương mại điện tử',
    business: 'Thành lập công ty / hộ kinh doanh',
    patent: 'Sáng chế / giải pháp hữu ích',
    renewal: 'Gia hạn / chuyển nhượng văn bằng',
    science: 'Doanh nghiệp khoa học và công nghệ',
    corporate: 'Tư vấn pháp lý doanh nghiệp',
  };

  /**
   * Nhu cầu chưa có dịch vụ riêng trong DB — ghi vào ô nội dung để đội tư vấn biết chính xác.
   * Hiện TRỐNG vì cả 13 thẻ dịch vụ đều đã có dịch vụ tương ứng. Giữ lại cơ chế làm lưới an
   * toàn: thêm thẻ mới mà quên tạo dịch vụ thì lead vẫn về, không rơi vào mailto.
   */
  const UNMAPPED_LABELS = {};

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /**
   * Mã một lần cho mỗi lần gửi form, gửi kèm sang trang cảm ơn qua ?sid=.
   * Trang cảm ơn dùng mã này làm cờ trong sessionStorage để F5 không tính thêm chuyển đổi.
   */
  function newSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function trackEvent(name, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  }

  function trackLead(source) {
    if (typeof window.gtag !== 'function') return;
    // Chỉ bắn khi có nhãn thật. Gửi send_to rỗng là gọi vô nghĩa, còn giữ nhãn của tài khoản cũ
    // thì số liệu chảy sang tài khoản đã bỏ mà không ai phát hiện.
    if (CONFIG.googleAdsConversion) {
      window.gtag('event', 'conversion', {
        send_to: CONFIG.googleAdsConversion,
        value: 1,
        currency: 'VND',
      });
    }
    window.gtag('event', 'generate_lead', { lead_source: source });
  }

  function initYear() {
    const year = $('#current-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initNavigation() {
    const toggle = $('.nav-toggle');
    const nav = $('#primary-nav');
    if (!toggle || !nav) return;

    const closeNav = (returnFocus = false) => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Mở menu');
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.setAttribute('aria-label', willOpen ? 'Đóng menu' : 'Mở menu');
      nav.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('nav-open', willOpen);
    });

    $$('a', nav).forEach((link) => link.addEventListener('click', () => closeNav(false)));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeNav(true);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && nav.classList.contains('is-open')) closeNav(false);
    });
  }

  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initServiceFilters() {
    const filters = $$('.filter');
    const cards = $$('.service-card');
    const empty = $('#filter-empty');
    if (!filters.length || !cards.length) return;

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.filter || 'all';
        let visibleCount = 0;

        filters.forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });

        cards.forEach((card) => {
          const visible = category === 'all' || card.dataset.category === category;
          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
            card.classList.add('is-visible');
          }
        });

        if (empty) empty.hidden = visibleCount > 0;
        trackEvent('select_content', { content_type: 'service_filter', item_id: category });
      });
    });
  }

  function initServiceSelection() {
    const serviceSelect = $('#service');
    // #consultation là thẻ <aside> bao ngoài (dùng để cuộn tới), còn #lead-form mới là <form>
    // (dùng để đọc/ghi các ô nhập). Lẫn hai cái này thì form.elements sẽ undefined.
    const panel = $('#consultation');
    const form = $('#lead-form');
    if (!serviceSelect || !panel || !form) return;

    $$('.choose-service').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.service;
        const option = $(`option[data-key="${key}"]`, serviceSelect);
        if (option) {
          serviceSelect.value = option.value;
          serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (UNMAPPED_LABELS[key]) {
          // Nhu cầu chưa có dịch vụ riêng trong DB: ghi thẳng vào ô nội dung để đội tư vấn biết
          // khách hỏi gì, thay vì để khách chọn bừa hoặc bấm mà không thấy gì xảy ra.
          const message = form.elements.message;
          const note = `Quan tâm: ${UNMAPPED_LABELS[key]}`;
          if (message && !message.value.includes(note)) {
            message.value = message.value.trim() ? `${note}. ${message.value.trim()}` : `${note}. `;
          }
        }
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => serviceSelect.focus({ preventScroll: true }), 650);
        trackEvent('select_content', { content_type: 'service', item_id: key || 'unknown' });
      });
    });

    const urlService = new URLSearchParams(window.location.search).get('service');
    if (urlService) {
      const option = $(`option[data-key="${CSS.escape(urlService)}"]`, serviceSelect);
      if (option) serviceSelect.value = option.value;
    }
  }

  function initAccordion() {
    $$('.accordion__item button').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.accordion__item');
        const panelId = button.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!item || !panel) return;

        const opening = button.getAttribute('aria-expanded') !== 'true';

        $$('.accordion__item').forEach((otherItem) => {
          const otherButton = $('button', otherItem);
          const otherPanelId = otherButton?.getAttribute('aria-controls');
          const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          otherItem.classList.remove('is-open');
          otherButton?.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.hidden = true;
        });

        if (opening) {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });
    });
  }

  function initBackToTop() {
    const button = $('.back-to-top');
    if (!button) return;

    const update = () => button.classList.toggle('is-visible', window.scrollY > 700);
    update();
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initContactTracking() {
    $$('[data-track]').forEach((element) => {
      element.addEventListener('click', () => {
        const source = element.dataset.track || 'contact';
        trackEvent('contact', { method: source.includes('zalo') ? 'zalo' : 'phone', source });
        trackLead(source);
      });
    });
  }

  function readCampaignData() {
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
    const params = new URLSearchParams(window.location.search);
    let saved = {};

    try {
      saved = JSON.parse(sessionStorage.getItem('poip_campaign') || '{}');
    } catch {
      saved = {};
    }

    keys.forEach((key) => {
      const value = params.get(key);
      if (value) saved[key] = value;
    });

    try {
      sessionStorage.setItem('poip_campaign', JSON.stringify(saved));
    } catch {
      // Trình duyệt chặn storage: form vẫn hoạt động bình thường.
    }

    return saved;
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  }

  /**
   * Dựng dropdown dịch vụ TỪ DB, không dùng danh sách tĩnh trong HTML.
   *
   * Trước đây HTML liệt kê 13 dịch vụ rồi cố dò id cho từng cái. DB chỉ có 9, nên 4 lựa chọn luôn
   * giữ giá trị "local:..." và khi gửi form thì bị ném lỗi rồi đẩy khách sang mailto — mất lead mà
   * không ai biết. Dựng từ DB thì dropdown không bao giờ chào một dịch vụ không tồn tại.
   */
  async function hydrateServiceIds() {
    const select = $('#service');
    if (!select) return;

    try {
      const response = await fetchWithTimeout(`${CONFIG.apiBaseUrl}${CONFIG.servicesPath}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const services = Array.isArray(payload?.data) ? payload.data : [];
      if (!services.length) return;

      // key -> href, đảo lại thành href -> key để tra theo dữ liệu DB.
      const keyByHref = Object.fromEntries(
        Object.entries(SERVICE_HREFS).map(([key, href]) => [href, key])
      );

      const options = [];
      services.forEach((service) => {
        if (!service?.id || !service?.href) return;
        const key = keyByHref[service.href];
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = (key && SERVICE_LABELS[key]) || service.title || service.href;
        if (key) option.dataset.key = key;
        option.dataset.href = service.href;
        options.push(option);
      });

      if (!options.length) return;

      const placeholder = select.querySelector('option[value=""]');
      select.textContent = '';
      if (placeholder) select.appendChild(placeholder);
      options.forEach((option) => select.appendChild(option));
      select.dataset.hydrated = 'true';
    } catch {
      // API không tới được: giữ danh sách tĩnh trong HTML. Lúc gửi form sẽ hiện kênh liên hệ dự
      // phòng thay vì im lặng thất bại.
    }
  }

  function setFieldError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
  }

  function validateForm(form) {
    const service = form.elements.service;
    const name = form.elements.name;
    const phone = form.elements.phone;
    const email = form.elements.email;
    const consent = form.elements.consent;
    let valid = true;

    setFieldError(service, service.value ? '' : 'Vui lòng chọn dịch vụ cần tư vấn.');
    setFieldError(name, name.value.trim().length >= 2 ? '' : 'Vui lòng nhập họ và tên.');

    const phoneDigits = phone.value.replace(/\D/g, '');
    setFieldError(
      phone,
      phoneDigits.length >= 9 && phoneDigits.length <= 12 ? '' : 'Số điện thoại chưa hợp lệ.'
    );

    const emailValue = email.value.trim();
    const emailValid = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    setFieldError(email, emailValid ? '' : 'Email chưa đúng định dạng.');

    const consentError = $('#consent-error');
    if (consentError)
      consentError.textContent = consent.checked ? '' : 'Vui lòng đồng ý để POIP liên hệ tư vấn.';
    consent.setAttribute('aria-invalid', String(!consent.checked));

    [service, name, phone, email].forEach((field) => {
      if (field.getAttribute('aria-invalid') === 'true') valid = false;
    });
    if (!consent.checked) valid = false;

    if (!valid) {
      const firstInvalid = $('[aria-invalid="true"]', form);
      firstInvalid?.focus();
    }

    return valid;
  }

  function buildFallbackEmail(data) {
    const subject = `Yêu cầu tư vấn — ${data.serviceName}`;
    const body = [
      `Họ và tên: ${data.name}`,
      `Số điện thoại: ${data.phone}`,
      `Email: ${data.email || 'Không cung cấp'}`,
      `Đối tượng: ${data.customerType}`,
      `Dịch vụ: ${data.serviceName}`,
      '',
      `Nội dung: ${data.message || 'Chưa cung cấp'}`,
      '',
      `Nguồn: ${CONFIG.source}`,
    ].join('\n');
    return `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showFormStatus(type, message, emailHref = '') {
    const status = $('#form-status');
    if (!status) return;
    status.className = `form-status is-${type}`;
    status.replaceChildren();

    const text = document.createElement('span');
    text.textContent = message;
    status.appendChild(text);

    if (emailHref) {
      const spacer = document.createTextNode(' ');
      const link = document.createElement('a');
      link.href = emailHref;
      link.textContent = 'Gửi yêu cầu qua email.';
      link.style.textDecoration = 'underline';
      link.style.textUnderlineOffset = '3px';
      status.append(spacer, link);
    }
  }

  async function submitLead(form, campaign) {
    const submitButton = $('button[type="submit"]', form);
    const selectedOption = form.elements.service.selectedOptions[0];
    const data = {
      serviceId: form.elements.service.value,
      serviceName: selectedOption?.textContent?.trim() || 'Chưa xác định',
      serviceKey: selectedOption?.dataset.key || '',
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      customerType: form.elements.customerType.value,
      message: form.elements.message.value.trim(),
    };

    const campaignText = Object.entries(campaign)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    const description = [
      `[Nguồn: ${CONFIG.source}]`,
      `[Đối tượng: ${data.customerType}]`,
      `[Dịch vụ: ${data.serviceName}]`,
      data.message,
      campaignText ? `[Chiến dịch: ${campaignText}]` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 1900);

    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang gửi yêu cầu...';
    }
    showFormStatus('success', 'Đang kết nối hệ thống tiếp nhận...');

    try {
      if (data.serviceId.startsWith('local:')) {
        throw new Error('Dịch vụ chưa được đồng bộ với hệ thống tiếp nhận.');
      }

      const response = await fetchWithTimeout(
        `${CONFIG.apiBaseUrl}${CONFIG.leadPath}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email,
            serviceId: data.serviceId,
            description,
          }),
        },
        12000
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json().catch(() => ({}));
      if (payload?.code && Number(payload.code) >= 400)
        throw new Error(payload.message || 'API error');

      trackLead('lead-form-success');
      showFormStatus('success', 'POIP đã nhận yêu cầu. Đang chuyển sang trang xác nhận...');
      form.reset();
      $$('[aria-invalid]', form).forEach((field) => field.setAttribute('aria-invalid', 'false'));
      $$('.field__error', form).forEach((error) => {
        error.textContent = '';
      });

      // Sang trang cảm ơn dùng chung với website. Đây là điều hướng CỨNG (đổi document), nên thẻ
      // Google trên /cam-on tự báo lượt tải trang cho Ads — khớp với hành động chuyển đổi kiểu
      // "Tải trang" đang đặt điều kiện URL chứa /cam-on.
      //
      // sid: mã một lần, để trang cảm ơn biết đây là lần gửi form thật và chỉ tính đúng một lần dù
      // khách F5. Truyền qua query vì tải cứng không giữ được state điều hướng của React Router.
      const sid = newSubmissionId();
      const params = new URLSearchParams({
        sid,
        src: CONFIG.source,
        service: data.serviceName || '',
      });
      window.location.assign(`${CONFIG.thankYouPath}?${params.toString()}`);
    } catch {
      const fallback = buildFallbackEmail(data);
      showFormStatus(
        'error',
        `Chưa thể gửi tự động. Vui lòng gọi ${CONFIG.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')} hoặc`,
        fallback
      );
      trackEvent('exception', { description: 'lead_form_submit_failed', fatal: false });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>Gửi yêu cầu tư vấn</span><span aria-hidden="true">→</span>';
        if (originalText) submitButton.setAttribute('aria-label', originalText.trim());
      }
    }
  }

  function initLeadForm() {
    const form = $('#lead-form');
    if (!form) return;
    const campaign = readCampaignData();

    ['service', 'name', 'phone', 'email'].forEach((name) => {
      const field = form.elements[name];
      field?.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateForm(form);
      });
      field?.addEventListener('change', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateForm(form);
      });
    });

    form.elements.consent?.addEventListener('change', () => {
      const error = $('#consent-error');
      if (error && form.elements.consent.checked) error.textContent = '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateForm(form)) return;
      submitLead(form, campaign);
    });

    hydrateServiceIds();
  }

  function init() {
    initYear();
    initNavigation();
    initReveal();
    initServiceFilters();
    initServiceSelection();
    initAccordion();
    initBackToTop();
    initContactTracking();
    initLeadForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

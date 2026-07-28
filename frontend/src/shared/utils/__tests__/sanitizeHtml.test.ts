import { sanitizeHtml } from '../sanitizeHtml';

describe('sanitizeHtml', () => {
  it('trả chuỗi rỗng khi đầu vào rỗng/null/undefined', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('giữ định dạng văn bản bình thường', () => {
    const out = sanitizeHtml('<p>Xin <strong>chào</strong></p>');
    expect(out).toContain('<strong>chào</strong>');
  });

  it('loại bỏ thẻ <script>', () => {
    const out = sanitizeHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain('<p>hi</p>');
  });

  it('loại bỏ handler sự kiện onerror', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(out).not.toMatch(/onerror/i);
  });

  it('loại bỏ URL javascript:', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it('thêm rel="noopener noreferrer" cho link target=_blank', () => {
    const out = sanitizeHtml('<a href="https://x.com" target="_blank">x</a>');
    expect(out).toMatch(/rel="noopener noreferrer"/);
  });
});

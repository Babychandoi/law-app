import { textOn, contrastRatio } from '../contrast';

describe('contrast util (WCAG 2.1)', () => {
  // Ba màu seed trạng thái CRM từng bị chữ trắng < 4.5:1 — nay phải chọn màu chữ đạt ≥ 4.5:1.
  it.each([
    ['#3B82F6', '#000000'],
    ['#8B5CF6', '#000000'],
    ['#10B981', '#000000'],
    ['#F59E0B', '#000000'],
  ])('textOn(%s) chọn màu đạt tương phản ≥ 4.5:1', (bg, expectedText) => {
    const fg = textOn(bg);
    expect(fg).toBe(expectedText);
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('nền tối chọn chữ trắng', () => {
    expect(textOn('#111827')).toBe('#ffffff');
    expect(contrastRatio('#ffffff', '#111827')).toBeGreaterThanOrEqual(4.5);
  });

  it('không có nền -> mặc định chữ tối', () => {
    expect(textOn(undefined)).toBe('#000000');
  });

  it('hỗ trợ hex 3 ký tự', () => {
    expect(textOn('#fff')).toBe('#000000');
    expect(textOn('#000')).toBe('#ffffff');
  });
});

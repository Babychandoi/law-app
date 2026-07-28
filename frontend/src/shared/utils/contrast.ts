// Tiện ích tương phản màu theo WCAG 2.1 — dùng chung cho chip/tag CRM và trang preview a11y.

/** Độ sáng tương đối (relative luminance) của màu hex, có hiệu chỉnh gamma sRGB. */
export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replace(/(.)/g, '$1$1') : h;
  const chan = (i: number) => {
    const c = (parseInt(full.slice(i, i + 2), 16) || 0) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
}

/** Tỉ lệ tương phản giữa hai màu (1..21) theo WCAG. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Chọn màu chữ (đen tuyền #000000 hoặc trắng #ffffff) đạt tương phản CAO NHẤT trên nền `bg`.
 * Dùng ĐEN TUYỀN thay vì xám-đậm để có biên an toàn: với màu tím giữa dải như #8B5CF6,
 * chữ #111827 chỉ đạt ~4.19:1 (trượt 4.5) trong khi #000000 đạt ~4.96:1.
 */
export function textOn(bg?: string): string {
  if (!bg) return '#000000';
  const L = relativeLuminance(bg);
  const contrastWhite = 1.05 / (L + 0.05);
  const contrastBlack = (L + 0.05) / 0.05;
  return contrastBlack >= contrastWhite ? '#000000' : '#ffffff';
}

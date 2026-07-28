import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Đo chiều rộng thực tế của navbar và quyết định bao nhiêu mục vừa khít trên 1 dòng;
 * phần dư (tính TỪ PHẢI sang) được gom vào một dropdown "⋯".
 *
 * Cách dùng: render mọi mục vào một hàng đo ẩn (đủ rộng, không wrap) để lấy bề rộng
 * từng mục, rồi container thật chỉ render `visibleCount` mục đầu + nút "⋯" nếu có dư.
 */
export function useOverflowMenu(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const recompute = () => {
      const available = container.clientWidth;
      // Bề rộng từng mục đo từ hàng ẩn (mỗi mục là 1 con trực tiếp của measure).
      const children = Array.from(measure.children) as HTMLElement[];
      const itemWidths = children.map((el) => el.offsetWidth);
      // Mục cuối trong hàng đo là nút "⋯" (luôn render để lấy bề rộng dự phòng).
      const moreWidth = itemWidths[itemWidths.length - 1] ?? 0;
      const widths = itemWidths.slice(0, itemCount);

      const total = widths.reduce((sum, w) => sum + w, 0);
      if (total <= available) {
        setVisibleCount(itemCount);
        return;
      }

      // Phải gom -> dành chỗ cho nút "⋯", rồi nhồi tối đa mục từ trái sang.
      let used = moreWidth;
      let count = 0;
      for (let i = 0; i < widths.length; i += 1) {
        if (used + widths[i] > available) break;
        used += widths[i];
        count += 1;
      }
      setVisibleCount(count);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [itemCount]);

  return { containerRef, measureRef, visibleCount };
}

// Mảnh class Tailwind dùng lặp trong bộ UI admin — gom về một nguồn để đồng bộ.
// (Giá trị màu/bo góc/đổ bóng gốc nằm ở tailwind.config.js.)

/** Focus ring theo thương hiệu, dùng cho nút và phần tử tương tác. */
export const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark/40';

/** Focus dạng ring đầy đủ cho ô nhập (input/select/textarea). */
export const FIELD_FOCUS =
  'outline-none focus:ring-2 focus:ring-brand-goldDark focus:border-brand-goldDark';

/** Nền + viền + bo góc cho ô nhập chuẩn. */
export const FIELD_BASE = `w-full rounded-control border border-gray-300 px-3 py-2 text-sm transition-colors ${FIELD_FOCUS}`;

/** Khối/thẻ chuẩn. */
export const CARD_BASE = 'bg-white rounded-card border border-gray-200 shadow-card';

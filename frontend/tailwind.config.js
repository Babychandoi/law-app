/** @type {import('tailwindcss').Config} */

// ===== Design tokens =====
// Nguồn sự thật duy nhất cho màu/bo góc/đổ bóng thương hiệu. Component dùng chung
// (src/component/common/ui) và các màn admin tham chiếu các token này thay vì
// hard-code giá trị rải rác. Đổi ở đây là đổi toàn hệ thống.
const brand = {
  ink: '#171717', // chữ chính
  muted: '#5f6368', // chữ phụ (đạt WCAG AA trên nền trắng)
  gold: '#c7942c', // nhấn chính
  goldDark: '#875f12', // nhấn đậm (nút, focus ring)
  line: '#e8e1d3', // viền/đường kẻ
  surface: '#f8f6f1', // nền nhạt
};

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: { brand },
      borderRadius: {
        // Bo góc chuẩn: control = nút/ô nhập, card = khối/thẻ.
        control: '0.5rem',
        card: '0.75rem',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 23, 23, 0.08)',
        card: '0 1px 2px rgba(23, 23, 23, 0.06), 0 1px 3px rgba(23, 23, 23, 0.05)',
      },
      ringColor: {
        // Focus ring mặc định theo thương hiệu.
        DEFAULT: brand.goldDark,
      },
    },
  },
  plugins: [],
};

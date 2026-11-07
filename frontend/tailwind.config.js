/** @type {import('tailwindcss').Config} */

// ===== Design tokens =====
// Nguồn sự thật duy nhất cho màu/bo góc/đổ bóng thương hiệu. Component dùng chung
// (src/component/common/ui) và các màn admin tham chiếu các token này thay vì
// hard-code giá trị rải rác. Đổi ở đây là đổi toàn hệ thống.
// Bảng màu "Tươi sáng & thân thiện": xanh ngọc làm màu chính, vàng nắng làm điểm nhấn.
const brand = {
  ink: '#1b2a3a', // chữ chính (xanh than đậm, 14.6:1 trên nền trắng)
  muted: '#4b5b6b', // chữ phụ (7:1 trên nền trắng)
  primary: '#0f766e', // màu chính: nút, liên kết, focus ring (chữ trắng 5.5:1)
  primaryDark: '#115e59', // trạng thái hover/nhấn của màu chính (chữ trắng 7.6:1)
  accent: '#f5b32d', // vàng nắng: icon, gạch nhấn, điểm nhấn (không dùng làm chữ nhỏ)
  accentSoft: '#fff1cc', // nền nhấn vàng nhạt (chữ ink 13:1)
  line: '#d8e6e1', // viền/đường kẻ
  surface: '#f1f8f6', // nền nhạt xanh bạc hà
};

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: { brand },
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      borderRadius: {
        // Bo góc chuẩn (mềm hơn): control = nút/ô nhập, card = khối/thẻ.
        control: '0.75rem',
        card: '1rem',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 118, 110, 0.12)',
        card: '0 1px 2px rgba(27, 42, 58, 0.06), 0 2px 8px rgba(15, 118, 110, 0.06)',
      },
      ringColor: {
        // Focus ring mặc định theo thương hiệu.
        DEFAULT: brand.primary,
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Mực (chữ chính) — đen hơi ám xanh indigo
          ink: '#161a2e',
          muted: '#4a5169',
          // Màu thương hiệu chính: Indigo (thay vai trò accent chủ đạo cũ)
          primary: '#2f4bd6',
          primaryDark: '#1e2f8f',
          primaryLight: '#4a63e0',
          // indigo nhạt để dùng trên nền tối (footer navy) — đủ tương phản AA
          onDark: '#9aa8ec',
          // Bỏ vàng — trỏ alias gold/goldDark về indigo để mọi class brand-gold* còn sót vẫn ra indigo
          gold: '#2f4bd6',
          goldDark: '#1e2f8f',
          // Bề mặt sáng
          surface: '#f5f7ff',
          line: '#dfe3f5',
          // Nền tối cho footer / điểm neo (navy-indigo)
          dark: '#141833',
          darkLine: 'rgba(255,255,255,0.10)',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(22, 26, 46, 0.10)',
      },
    },
  },
  plugins: [],
};

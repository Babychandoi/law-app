import { defineConfig, devices } from '@playwright/test';

/**
 * Cấu hình E2E (Playwright). Chạy trên môi trường ĐANG CHẠY (mặc định prod), KHÔNG tự dựng server.
 * Thông tin đăng nhập lấy từ biến môi trường — KHÔNG commit credential vào repo.
 *
 * Cách chạy:
 *   npx playwright install chromium            # lần đầu, tải trình duyệt
 *   E2E_ADMIN_USER=... E2E_ADMIN_PASS=... \
 *   E2E_STAFF_USER=... E2E_STAFF_PASS=... \
 *   npx playwright test                        # hoặc npm run e2e
 *
 * Ghi đè URL: E2E_BASE_URL=https://luatpoip.com (mặc định).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://luatpoip.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Đăng nhập MỘT LẦN mỗi vai trò rồi lưu session (tránh trip rate-limit /auth/login = 10/5phút).
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],
});

import { test, expect } from '@playwright/test';
import { LOGIN_URL } from './helpers';

/**
 * Visual regression (P2.10) — so ảnh chụp với baseline để phát hiện thay đổi giao diện ngoài ý muốn.
 * Chỉ chụp các trang PUBLIC tĩnh, tất định (không cần đăng nhập / secret prod):
 *  - Trang preview `/2025/luatpoip/_a11y` (gom Button/Input/Badge + chip màu CRM)
 *  - Trang đăng nhập admin
 *
 * Baseline được sinh & so sánh TRONG cùng Docker image `mcr.microsoft.com/playwright` để render
 * ổn định giữa máy local và CI (xem workflow `visual`).
 */
test.describe('Visual regression (public)', () => {
  test('Trang preview UI', async ({ page }) => {
    await page.goto('/2025/luatpoip/_a11y', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'A11y Preview' })).toBeVisible();
    await expect(page).toHaveScreenshot('a11y-preview.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Trang đăng nhập admin', async ({ page }) => {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page).toHaveScreenshot('admin-login.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});

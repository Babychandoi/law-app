import { test, expect } from '@playwright/test';
import { login, adminCreds, staffCreds, ADMIN_BASE } from './helpers';

const TEAM_CHAT = `${ADMIN_BASE}/team-chat`;

test.describe('Chat nội bộ — danh bạ nhân sự', () => {
  test('NHÂN VIÊN tải được danh bạ (regression fix 502)', async ({ page }) => {
    const c = staffCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_STAFF_USER/PASS');
    await login(page, c);

    // Mở trang chat -> TeamChat gọi GET /staff-chat/users khi mount.
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/staff-chat/users'), { timeout: 20_000 }),
      page.goto(TEAM_CHAT),
    ]);
    // Trước khi vá: nhân viên nhận 502. Sau vá: 200.
    expect(resp.status()).toBe(200);

    // Mở picker "Nhắn tin mới" -> hiện panel chọn nhân viên.
    await page.getByRole('button', { name: 'Nhắn tin mới' }).click();
    await expect(page.getByText('Bắt đầu nhắn riêng')).toBeVisible();
  });

  test('ADMIN tải được danh bạ', async ({ page }) => {
    const c = adminCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
    await login(page, c);
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/staff-chat/users'), { timeout: 20_000 }),
      page.goto(TEAM_CHAT),
    ]);
    expect(resp.status()).toBe(200);
  });
});

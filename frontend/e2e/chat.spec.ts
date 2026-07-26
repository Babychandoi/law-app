import { test, expect, type Page } from '@playwright/test';
import { ADMIN_BASE } from './helpers';

const ADMIN_STATE = 'e2e/.auth/admin.json';
const STAFF_STATE = 'e2e/.auth/staff.json';
const TEAM_CHAT = `${ADMIN_BASE}/team-chat`;

async function expectDirectoryLoads(page: Page) {
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/staff-chat/users'), { timeout: 20_000 }),
    page.goto(TEAM_CHAT),
  ]);
  // Trước khi vá: nhân viên nhận 502. Sau vá: 200.
  expect(resp.status()).toBe(200);
}

test.describe('Chat nội bộ — danh bạ (NHÂN VIÊN, regression fix 502)', () => {
  test.use({ storageState: STAFF_STATE });
  test('NHÂN VIÊN tải được danh bạ + mở picker', async ({ page }) => {
    await expectDirectoryLoads(page);
    await page.getByRole('button', { name: 'Nhắn tin mới' }).click();
    await expect(page.getByText('Bắt đầu nhắn riêng')).toBeVisible();
  });
});

test.describe('Chat nội bộ — danh bạ (ADMIN)', () => {
  test.use({ storageState: ADMIN_STATE });
  test('ADMIN tải được danh bạ', async ({ page }) => {
    await expectDirectoryLoads(page);
  });
});

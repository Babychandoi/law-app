import { test, expect } from '@playwright/test';
import { login, adminCreds, staffCreds, ADMIN_BASE, SYS_BASE, LOGIN_URL } from './helpers';

test.describe('Đăng nhập & phân quyền', () => {
  test('sai mật khẩu -> vẫn ở trang login', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('input[name="username"]').fill('khong_ton_tai_xyz');
    await page.locator('input[name="password"]').fill('saibetnhe123');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('ADMIN đăng nhập được và vào khu Hệ thống', async ({ page }) => {
    const c = adminCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
    await login(page, c);
    // Admin mở được khu Hệ thống (không bị đẩy về Vận hành).
    await page.goto(SYS_BASE);
    await expect(page).toHaveURL(new RegExp(SYS_BASE));
  });

  test('NHÂN VIÊN (USER) bị chặn khỏi khu Hệ thống -> đẩy về Vận hành', async ({ page }) => {
    const c = staffCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_STAFF_USER/PASS');
    await login(page, c);
    // Truy cập thẳng khu Hệ thống -> guard đẩy về /admin (không được ở /he-thong).
    await page.goto(SYS_BASE);
    await expect(page).toHaveURL(new RegExp(`${ADMIN_BASE}(?!/login)`));
    await expect(page).not.toHaveURL(new RegExp(SYS_BASE));
  });
});

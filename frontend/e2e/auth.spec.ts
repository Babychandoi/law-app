import { test, expect } from '@playwright/test';
import { login, adminCreds, ADMIN_BASE, SYS_BASE, LOGIN_URL } from './helpers';

const ADMIN_STATE = 'e2e/.auth/admin.json';
const STAFF_STATE = 'e2e/.auth/staff.json';

test.describe('Đăng nhập', () => {
  test('sai mật khẩu -> vẫn ở trang login', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('input[name="username"]').fill('khong_ton_tai_xyz');
    await page.locator('input[name="password"]').fill('saibetnhe123');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('ADMIN đăng nhập thành công vào khu Vận hành', async ({ page }) => {
    const c = adminCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
    await login(page, c);
  });
});

test.describe('Phân quyền — ADMIN', () => {
  test.use({ storageState: ADMIN_STATE });
  test('ADMIN vào được khu Hệ thống', async ({ page }) => {
    await page.goto(SYS_BASE);
    await expect(page).toHaveURL(new RegExp(SYS_BASE));
  });
});

test.describe('Phân quyền — NHÂN VIÊN', () => {
  test.use({ storageState: STAFF_STATE });
  test('NHÂN VIÊN (USER) bị chặn khỏi khu Hệ thống -> đẩy về Vận hành', async ({ page }) => {
    await page.goto(SYS_BASE);
    await expect(page).toHaveURL(new RegExp(`${ADMIN_BASE}(?!/login)`));
    await expect(page).not.toHaveURL(new RegExp(SYS_BASE));
  });
});

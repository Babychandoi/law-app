import { test, expect } from '@playwright/test';
import { login, adminCreds, staffCreds, ADMIN_BASE, SYS_BASE } from './helpers';

test.describe('Điều hướng & bảng admin', () => {
  test('ADMIN mở màn Khách hàng (DataTable render)', async ({ page }) => {
    const c = adminCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
    await login(page, c);
    await page.goto(`${ADMIN_BASE}/customers`);
    await expect(page.getByRole('heading', { name: 'Quản lý khách hàng' })).toBeVisible();
  });

  test('ADMIN mở màn Người đăng ký ở khu Hệ thống', async ({ page }) => {
    const c = adminCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
    await login(page, c);
    await page.goto(`${SYS_BASE}/subscribers`);
    await expect(page).toHaveURL(new RegExp(SYS_BASE));
    await expect(page.getByRole('heading', { name: 'Quản lý người đăng ký' })).toBeVisible();
  });

  test('NHÂN VIÊN mở được màn Khách hàng (khu Vận hành)', async ({ page }) => {
    const c = staffCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_STAFF_USER/PASS');
    await login(page, c);
    await page.goto(`${ADMIN_BASE}/customers`);
    await expect(page.getByRole('heading', { name: 'Quản lý khách hàng' })).toBeVisible();
  });

  test('NHÂN VIÊN vào màn Hệ thống -> bị đẩy về Vận hành', async ({ page }) => {
    const c = staffCreds();
    test.skip(!c.user || !c.pass, 'Thiếu E2E_STAFF_USER/PASS');
    await login(page, c);
    await page.goto(`${SYS_BASE}/subscribers`);
    await expect(page).not.toHaveURL(new RegExp(SYS_BASE));
  });
});

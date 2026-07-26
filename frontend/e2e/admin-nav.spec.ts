import { test, expect } from '@playwright/test';
import { ADMIN_BASE, SYS_BASE } from './helpers';

const ADMIN_STATE = 'e2e/.auth/admin.json';
const STAFF_STATE = 'e2e/.auth/staff.json';

test.describe('Điều hướng & bảng — ADMIN', () => {
  test.use({ storageState: ADMIN_STATE });

  test('mở màn Khách hàng (DataTable render)', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/customers`);
    await expect(page.getByRole('heading', { name: 'Quản lý khách hàng' })).toBeVisible();
  });

  test('mở màn Người đăng ký ở khu Hệ thống', async ({ page }) => {
    await page.goto(`${SYS_BASE}/subscribers`);
    await expect(page).toHaveURL(new RegExp(SYS_BASE));
    await expect(page.getByRole('heading', { name: 'Quản lý người đăng ký' })).toBeVisible();
  });
});

test.describe('Điều hướng & bảng — NHÂN VIÊN', () => {
  test.use({ storageState: STAFF_STATE });

  test('mở được màn Khách hàng (khu Vận hành)', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/customers`);
    await expect(page.getByRole('heading', { name: 'Quản lý khách hàng' })).toBeVisible();
  });

  test('vào màn Hệ thống -> bị đẩy về Vận hành', async ({ page }) => {
    await page.goto(`${SYS_BASE}/subscribers`);
    await expect(page).not.toHaveURL(new RegExp(SYS_BASE));
  });
});

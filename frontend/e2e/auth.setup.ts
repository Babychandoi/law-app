import { test as setup } from '@playwright/test';
import fs from 'fs';
import { login, adminCreds, staffCreds } from './helpers';

// Đăng nhập một lần mỗi vai trò, lưu session ra file để các spec tái sử dụng
// (không phải đăng nhập lại từng test -> tránh vượt rate-limit /auth/login).

setup('đăng nhập admin & lưu session', async ({ page }) => {
  const c = adminCreds();
  setup.skip(!c.user || !c.pass, 'Thiếu E2E_ADMIN_USER/PASS');
  await login(page, c);
  fs.mkdirSync('e2e/.auth', { recursive: true });
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});

setup('đăng nhập nhân viên & lưu session', async ({ page }) => {
  const c = staffCreds();
  setup.skip(!c.user || !c.pass, 'Thiếu E2E_STAFF_USER/PASS');
  await login(page, c);
  fs.mkdirSync('e2e/.auth', { recursive: true });
  await page.context().storageState({ path: 'e2e/.auth/staff.json' });
});

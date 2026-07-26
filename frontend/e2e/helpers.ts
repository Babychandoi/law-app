import { Page, expect } from '@playwright/test';

export const ADMIN_BASE = '/2025/luatpoip/admin';
export const SYS_BASE = '/2025/luatpoip/he-thong';
export const LOGIN_URL = `${ADMIN_BASE}/login`;

export interface Creds {
  user: string;
  pass: string;
}

export function adminCreds(): Creds {
  return { user: process.env.E2E_ADMIN_USER || '', pass: process.env.E2E_ADMIN_PASS || '' };
}
export function staffCreds(): Creds {
  return { user: process.env.E2E_STAFF_USER || '', pass: process.env.E2E_STAFF_PASS || '' };
}

/** Đăng nhập qua UI và chờ vào khu Vận hành. */
export async function login(page: Page, creds: Creds): Promise<void> {
  await page.goto(LOGIN_URL);
  await page.locator('input[name="username"]').fill(creds.user);
  await page.locator('input[name="password"]').fill(creds.pass);
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  // Sau đăng nhập thành công điều hướng về /admin (không còn ở trang login).
  await expect(page).toHaveURL(new RegExp(`${ADMIN_BASE}(?!/login)`), { timeout: 20_000 });
}

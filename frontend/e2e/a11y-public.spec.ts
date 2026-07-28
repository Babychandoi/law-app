import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LOGIN_URL } from './helpers';

/**
 * Cổng chặn a11y trong CI — KHÔNG cần đăng nhập / secret prod.
 * Chạy trên bản build tĩnh (E2E_BASE_URL=http://localhost:3000) với các trang public:
 *  - Trang đăng nhập admin (nút/ô nhập, design token dùng chung)
 *  - Trang preview `/2025/luatpoip/_a11y` (gom Button/Input/Badge + chip màu CRM theo WCAG)
 * Bắt lỗi tương phản màu ngay ở PR, độc lập với dữ liệu prod.
 */
async function expectNoContrastViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  const details = results.violations
    .flatMap((v) =>
      v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary ?? ''}`)
    )
    .join('\n');
  expect(results.violations, `Lỗi tương phản màu:\n${details}`).toEqual([]);
}

test.describe('A11y (public, CI gate) — color-contrast', () => {
  test('Trang đăng nhập admin', async ({ page }) => {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test('Trang preview UI (Button/Input/Badge + chip CRM)', async ({ page }) => {
    await page.goto('/2025/luatpoip/_a11y', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'A11y Preview' })).toBeVisible();
    await expectNoContrastViolations(page);
  });
});

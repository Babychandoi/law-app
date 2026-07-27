import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ADMIN_BASE, SYS_BASE, LOGIN_URL } from './helpers';

const ADMIN_STATE = 'e2e/.auth/admin.json';

/**
 * Kiểm tra khả năng tiếp cận bằng axe-core trên trình duyệt thật (có layout + màu tính toán).
 * Mục tiêu chốt P0.8: KHÔNG còn lỗi tương phản màu (color-contrast) trên các màn chính.
 * Contrast chỉ đo được ở trình duyệt thật — jsdom không dựng layout nên không thể kiểm.
 */

// Chỉ khẳng định "đạt" cho tương phản màu — đây là phạm vi P0.8.
async function expectNoContrastViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  const details = results.violations
    .flatMap((v) =>
      v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary ?? ''}`)
    )
    .join('\n');
  expect(results.violations, `Lỗi tương phản màu:\n${details}`).toEqual([]);
}

test.describe('A11y — tương phản màu (color-contrast)', () => {
  test('Trang đăng nhập admin', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test.describe('Khu quản trị (đã đăng nhập)', () => {
    test.use({ storageState: ADMIN_STATE });

    test('Màn Khách hàng (DataTable + PageHeader + sidebar)', async ({ page }) => {
      await page.goto(`${ADMIN_BASE}/customers`);
      await expect(page.getByRole('heading', { name: 'Quản lý khách hàng' })).toBeVisible();
      await expectNoContrastViolations(page);
    });

    test('Màn Người đăng ký (khu Hệ thống)', async ({ page }) => {
      await page.goto(`${SYS_BASE}/subscribers`);
      await expect(page.getByRole('heading', { name: 'Quản lý người đăng ký' })).toBeVisible();
      await expectNoContrastViolations(page);
    });
  });
});

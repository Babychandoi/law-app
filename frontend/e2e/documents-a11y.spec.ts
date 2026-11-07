import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * A11y + mobile cho khu Quản lý tài liệu (/2025/luatpoip/tai-lieu).
 * - Desktop: axe kiểm tương phản màu + tên khả truy cập (button/link/select/label).
 * - Mobile 390px: axe + không tràn ngang (scrollWidth ~ clientWidth).
 * Chạy trong project `chromium` (đã đăng nhập qua auth.setup). Cần secrets E2E_* như bộ e2e còn lại.
 */

const ADMIN_STATE = 'e2e/.auth/admin.json';
const BASE = '/2025/luatpoip/tai-lieu';

// Các rule quan tâm: tương phản + tên khả truy cập cho control.
const RULES = [
  'color-contrast',
  'button-name',
  'link-name',
  'select-name',
  'label',
  'aria-input-field-name',
];

const SCREENS: Array<{ name: string; path: string }> = [
  { name: 'Biểu mẫu', path: BASE },
  { name: 'Tổng quan', path: `${BASE}/dashboard` },
  { name: 'Tài liệu đã tạo', path: `${BASE}/generated` },
  { name: 'Bộ mẫu', path: `${BASE}/bundles` },
  { name: 'Điều khoản', path: `${BASE}/clauses` },
];

async function gotoDocScreen(page: Page, path: string) {
  await page.goto(path);
  // Header của DocumentLayout luôn hiện — mốc ổn định cho mọi trang tài liệu.
  await expect(page.getByRole('heading', { name: 'Tài liệu & biểu mẫu' })).toBeVisible();
  await page.waitForTimeout(800); // chờ dữ liệu + màu render để axe đo tương phản thật
}

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withRules(RULES).analyze();
  const details = results.violations
    .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary ?? ''}`))
    .join('\n');
  expect(results.violations, `Lỗi a11y:\n${details}`).toEqual([]);
}

test.describe('A11y khu Tài liệu (đã đăng nhập)', () => {
  test.use({ storageState: ADMIN_STATE });

  for (const screen of SCREENS) {
    test(`Desktop · ${screen.name}`, async ({ page }) => {
      await gotoDocScreen(page, screen.path);
      await expectNoViolations(page);
    });
  }

  test.describe('Mobile 390px', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const screen of SCREENS) {
      test(`${screen.name} — a11y + không tràn ngang`, async ({ page }) => {
        await gotoDocScreen(page, screen.path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `Trang bị tràn ngang ${overflow}px trên mobile`).toBeLessThanOrEqual(1);
        await expectNoViolations(page);
      });
    }
  });
});

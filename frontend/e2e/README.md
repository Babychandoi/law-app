# E2E tests (Playwright)

Kiểm thử end-to-end trên giao diện thật (mặc định prod). Khác unit test: chạy trình duyệt
thật, đăng nhập thật, kiểm điều hướng/phân quyền ở tầng UI.

## Cài đặt (lần đầu)

```powershell
cd frontend
npm install                       # đã có @playwright/test trong devDependencies
npx playwright install chromium   # tải trình duyệt Chromium
```

## Chạy

Đặt credential qua biến môi trường (KHÔNG commit vào repo):

```powershell
$env:E2E_ADMIN_USER="<admin_username>"; $env:E2E_ADMIN_PASS="<admin_password>"
$env:E2E_STAFF_USER="<staff_username>"; $env:E2E_STAFF_PASS="<staff_password>"
npm run e2e            # chạy toàn bộ
npm run e2e:ui         # chạy có giao diện xem từng bước
```

Ghi đè môi trường đích: `$env:E2E_BASE_URL="https://luatpoip.com"` (mặc định prod).

Chỉ chạy bộ a11y + mobile khu tài liệu:

```powershell
npm run e2e:documents
```

## `E2E_ADMIN_USER/PASS` là gì & lấy ở đâu

Là **tài khoản đăng nhập** ở `/2025/luatpoip/admin/login` (username + mật khẩu). `auth.setup.ts`
dùng nó để đăng nhập một lần và lưu session cho các test đã-đăng-nhập; nếu thiếu, các test đó **tự
bỏ qua** (không fail).

- `E2E_ADMIN_USER/PASS`: một tài khoản **vai trò ADMIN**.
- `E2E_STAFF_USER/PASS`: một tài khoản **vai trò USER (nhân viên)**.

> Khuyến nghị: tạo **tài khoản test riêng** (vd `e2e-admin`) thay vì dùng tài khoản cá nhân —
> các test này chỉ ĐỌC (điều hướng + axe), nhưng tách tài khoản giúp an toàn và dễ thu hồi.

### Thêm secrets vào GitHub (để chạy trong CI)

Qua GitHub UI: **Settings → Secrets and variables → Actions → New repository secret**, thêm 4 secret:
`E2E_ADMIN_USER`, `E2E_ADMIN_PASS`, `E2E_STAFF_USER`, `E2E_STAFF_PASS`.

Hoặc bằng `gh` CLI (đã đăng nhập repo):

```bash
gh secret set E2E_ADMIN_USER   # dán username khi được hỏi
gh secret set E2E_ADMIN_PASS   # dán mật khẩu
gh secret set E2E_STAFF_USER
gh secret set E2E_STAFF_PASS
```

Sau khi có secrets: chạy thủ công workflow **e2e** (tab Actions → e2e → Run workflow), hoặc bật
`schedule` trong `.github/workflows/e2e.yml` để chạy định kỳ.

## Phạm vi hiện có (9 test)

**`auth.spec.ts`** — đăng nhập & phân quyền:
- Sai mật khẩu → vẫn ở trang login.
- ADMIN đăng nhập → mở được khu Hệ thống (`/he-thong`).
- NHÂN VIÊN (USER) → truy cập `/he-thong` bị guard đẩy về Vận hành (`/admin`).

**`admin-nav.spec.ts`** — điều hướng & bảng:
- ADMIN mở màn Khách hàng (DataTable render) và Người đăng ký (khu Hệ thống).
- NHÂN VIÊN mở được Khách hàng (Vận hành) nhưng bị đẩy khỏi màn Hệ thống.

**`chat.spec.ts`** — chat nội bộ:
- NHÂN VIÊN & ADMIN tải được danh bạ `/staff-chat/users` (200) — regression cho fix 502.
- NHÂN VIÊN mở được picker "Nhắn tin mới".

Test tự bỏ qua (skip) nếu thiếu biến môi trường credential tương ứng.

> Lưu ý: các spec cố ý CHỈ kiểm đăng nhập/điều hướng/phân quyền (không tạo/sửa/xoá dữ liệu)
> để an toàn khi chạy trên prod. Muốn test CRUD nên chạy trên môi trường staging riêng.

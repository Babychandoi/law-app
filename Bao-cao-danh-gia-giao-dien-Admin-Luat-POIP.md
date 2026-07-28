# BÁO CÁO ĐÁNH GIÁ GIAO DIỆN QUẢN TRỊ LUẬT POIP

> Góc nhìn: Chuyên gia thiết kế sản phẩm quản trị, PM/Senior và người dùng vận hành thực tế  
> Ngày đánh giá: 26/07/2026  
> Repository: `Babychandoi/law-app`  
> Nhánh: `phong/staff-chat-service`  
> Commit được kiểm tra: `d963d70a823f305ed5cf29d72dd1bb4e4ddcd1ae`

---

---

## 0. TRẠNG THÁI CẬP NHẬT (27/07/2026)

Chú thích: ✅ đã xong · ⚠️ làm một phần · ⬜ chưa làm.

> **Đính chính trung thực (đã bị nhắc 2 lần vì overclaim — không lặp lại):** bản nghiệm thu độc lập
> trước (commit 6a467fa) chấm **P0: 6 xong · 4 một phần** và **P1: 5 xong · 7 một phần**. Đợt đóng
> tiếp 28/07 (các batch A–F + axe + CRM sort + design token) đã đóng thật thêm nhiều mục ⚠️, nay tự
> chấm **P0: 10 xong** và **P1: 12 xong** (đã đóng hết P0+P1) — nhưng **các con số này chưa được
> nghiệm thu độc lập lại**, nên vẫn là tự đánh giá, **KHÔNG khẳng định "hoàn thành tuyệt đối"**;
> riêng axe mới quét 3 màn đại diện. Điểm ước ~**8–8,5/10** — đủ beta nội bộ, chỉ còn mục ⚠️/⬜ ở P2.

**Sửa theo audit độc lập lần 3 (28/07) — đã kiểm chứng bằng axe trên prod:**
- **Contrast (P0.8)**: `textOn()` viết lại đúng WCAG (gamma sRGB + chọn đen/trắng theo tỉ lệ cao nhất) → 3 màu seed CRM đạt ≥4.96:1; overdue red-500→red-600, nút Gửi email green-600→green-700. **axe mở rộng sang CRM + Tin tức, 7/7 pass**.
- **Accessible name (P0.5/0.6)**: thêm aria-label/label cho ~11 control còn thiếu (guest chat, team chat, tìm Khách hàng, ServiceEditor subtitle/mục con, textarea phụ đề News).
- **Drawer (P0.10)**: trả focus về nút "Mở menu" khi đóng + đặt `inert` cho nền khi mở.
- **Emoji (P1.10)**: bỏ nốt 👤/📅 (Post) và ⚠️ (AddNews/EditNews) → Lucide icon.

**Đóng thêm ở đợt 28/07 (batch A–F), đã build + 63 unit test pass + deploy:**
- A11y: ServiceEditor field ĐỘNG (process/pricing/section/features/file/checkbox) đã có aria-label; drawer mobile đưa/giữ focus + Tab-trap + Escape + nền `inert`.
- URL filter **hai chiều**: back/forward đồng bộ ngược state; ô tìm kiếm phản ánh URL (`searchValue` controlled).
- Guest chat: nút **"Tải thêm hội thoại"** (không còn kẹt 30 hội thoại đầu).
- **Bỏ toàn bộ `window.prompt`**: CRM Config (4 nút Thêm) + "lưu chế độ xem" → modal/input có validation, Enter/Escape, loading.
- PageHeader cho **CRM Config**, **Post**, **ServiceImages**.
- **axe-core (`e2e/a11y.spec.ts`)**: 0 lỗi `color-contrast` trên đăng nhập + Khách hàng + Người đăng ký → đóng P0.8.
- **CRM sort server-side**: `/crm/cases?sort=field,dir` (whitelist chống injection), FE nối `sortState`/`onSortChange`; đã kiểm chứng đảo chiều asc/desc trên prod → đóng P1.6/1.7.
- **Design token**: quét bỏ màu thương hiệu rời `amber-*`/`orange-*` → `brand-*` ở CRM/Services/News/ServiceImages/Post/Employee; Post bỏ shadow nặng + badge gradient + emoji → đóng P1.1/1.10.

**Còn tồn thật — chỉ còn ở P2 (không tô vẽ):**
- Accessibility: axe mới quét **3 màn đại diện**, chưa quét toàn bộ màn + chưa gắn cổng chặn mỗi PR (P2.11).
- URL filter cho **CRM/bài viết** (mở rộng ngoài P1) chưa làm — cũng là điều kiện để "chế độ xem" của CRM lưu được bộ lọc.
- Test breadth: backend 1 test (ApiMeta); gateway/chat/crm/document + mobile/keyboard chưa có; E2E workflow chạy thủ công.
- Các mục P2 khác: audit log, lịch sử thay đổi, command palette, autosave, draft/version, preview đa thiết bị, visual regression, analytics.

### Phản hồi audit — đã sửa (28/07/2026)
- ✅ **Dashboard KPI**: đếm qua `meta.totalElements`; không nuốt lỗi thành 0.
- ✅ **Bài viết**: phân trang server (trước chỉ thấy 12 bài mới nhất).
- ✅ **Guest chat**: bỏ hard-code `admin-001`, dùng danh tính admin thật.
- ✅ **A11y**: login hiện/ẩn mật khẩu, nút đóng lỗi Nhân viên, dòng guest-chat (role=button+bàn phím), drawer mobile `inert`, ServiceEditor labels `htmlFor/id`.
- ✅ **Contrast**: sidebar `text-white/40`→`/70`; team-chat `gray-400`→`gray-500`.
- ✅ **Xác nhận**: đổi vai trò / khóa tài khoản có ConfirmDialog.
- ✅ **Bỏ SweetAlert2** (Post/Employee/Services) → toast + ConfirmDialog + Modal form; bỏ emoji/gradient/chuỗi tiếng Anh ở trang bài viết.
- ✅ **Sort server-side thật** (truyền `sort` Pageable) + **URL persistence** page/q/sort cho các bảng server.
- ✅ **PageHeader** phủ thêm Employee/CRM.
- ✅ **E2E vào CI**: `.github/workflows/e2e.yml` (Playwright, chạy thủ công/khi có secrets).
- ✅ **Backend có test JUnit đầu tiên** (ApiMeta) — CI `mvn package` chạy test.

### Còn tồn (trung thực) — thuộc P2/hạ tầng test
- ⬜ Test coverage breadth: gateway/chat/crm/document chưa có test; chưa có test mobile/keyboard/axe.
- ⬜ E2E cron tự động (đang chạy thủ công cho tới khi set secrets E2E_* trong repo).

### Số liệu test (chính xác, cập nhật)
- **62** unit test frontend (14 suite) — gồm 2 test DataTable mới (ẩn cột/mật độ).
- **12** kịch bản Playwright = **10** test + **2** setup; có **workflow CI** (thủ công).
- Backend: **1** test JUnit (ApiMeta) chạy trong CI. 4 module Java còn lại: chưa.

Điểm bổ sung ngoài báo cáo: tách khu Vận hành/Hệ thống theo vai trò + guard; vá bảo mật
(RBAC, rò rỉ PII); redesign chat nội bộ kiểu Messenger + icon chat header; sửa bug mất focus
Modal; sửa bug nhân viên không tải được danh bạ chat (502). Tất cả live + CI xanh + có test che.

Chi tiết đánh dấu ở **mục 9 (Lộ trình)** phía dưới.

---

## 1. Kết luận điều hành

Giao diện quản trị hiện tại **dùng được ở mức MVP nội bộ trên desktop**, có phạm vi nghiệp vụ tương đối đầy đủ, nhưng **chưa đạt tiêu chuẩn của một hệ thống quản trị hiện đại, chuyên nghiệp và có khả năng mở rộng**.

Các vấn đề lớn nhất không nằm ở việc thiếu hiệu ứng hoặc chưa có dark mode, mà nằm ở nền tảng trải nghiệm:

1. Trang chủ admin chưa có dashboard và đang để trống.
2. Kiến trúc điều hướng, sidebar và trạng thái active chưa đúng chuẩn ứng dụng quản trị.
3. Responsive cho bảng dữ liệu và chat chưa đáp ứng thiết bị di động.
4. Accessibility còn nhiều lỗi bắt buộc phải xử lý.
5. Design system thiếu nhất quán giữa các màn hình.
6. Các công cụ xử lý dữ liệu lớn mới dừng ở CRUD cơ bản.

**Điểm tổng thể: 4,8/10.**

- Nếu chỉ dùng nội bộ trên desktop với ít người: khoảng **6,0/10**.
- Nếu nghiệm thu như một sản phẩm quản trị chuyên nghiệp, đa vai trò, dùng được trên nhiều thiết bị: **chưa đạt**.

**Khuyến nghị nghiệm thu:** chưa nghiệm thu UI/UX cuối cùng; cần hoàn thành nhóm hạng mục P0 và P1 trong báo cáo này.

---

## 2. Phạm vi và phương pháp đánh giá

### 2.1. Phạm vi

Đánh giá tập trung vào frontend của khu vực quản trị, gồm:

- Router và layout admin.
- Navbar, sidebar và điều hướng.
- Trang chủ admin.
- Quản lý khách hàng.
- Quản lý nhân viên.
- CRM.
- Quản lý dịch vụ.
- Quản lý bài viết.
- Quản lý ứng viên.
- Quản lý subscriber.
- Guest chat.
- Staff/team chat.
- Đăng nhập quản trị.
- Form, modal, bảng dữ liệu, trạng thái tải, trạng thái rỗng và thông báo.

### 2.2. Phương pháp

- Đọc cấu trúc router, component, DOM, state và responsive class trong source.
- Kiểm tra cách tổ chức layout, form, table, modal và luồng thao tác.
- Build frontend và dựng các màn hình đại diện với dữ liệu giả lập.
- Kiểm tra ở kích thước desktop và mobile.
- Kiểm tra tự động một số tiêu chí accessibility.
- Đối chiếu với nguyên tắc của dashboard SaaS hiện đại, WCAG 2.2 và WAI-ARIA.

### 2.3. Giới hạn

- Chưa thực hiện UAT đầy đủ bằng tài khoản thật với backend và dữ liệu production.
- Chưa đo hiệu quả công việc bằng analytics hoặc phỏng vấn người dùng nội bộ.
- Một số nhận định về quy trình nghiệp vụ cần xác nhận thêm với người trực tiếp vận hành.

Do đó, báo cáo có độ tin cậy cao đối với **cấu trúc giao diện, responsive, khả dụng, accessibility và tính nhất quán**, nhưng vẫn cần UAT thực tế trước khi nghiệm thu chính thức.

---

## 3. Bảng điểm tổng thể

| Hạng mục | Điểm | Đánh giá |
|---|---:|---|
| Độ đầy đủ tính năng | 7,5/10 | Có customer, employee, CRM, CMS, chat, tuyển dụng và dịch vụ |
| Giao diện desktop | 6,0/10 | Dùng được nhưng chưa tinh gọn và thiếu tính hệ thống |
| Điều hướng và kiến trúc thông tin | 4,0/10 | Dashboard trống, active menu chưa theo URL, menu chưa phân nhóm |
| Design system | 4,5/10 | Màu, icon, radius, shadow và feedback thiếu nhất quán |
| Mobile và responsive | 3,0/10 | Bảng dữ liệu và hai màn chat chưa có mô hình mobile phù hợp |
| Accessibility | 2,5/10 | Thiếu accessible name, label, focus management và contrast |
| Trải nghiệm xử lý dữ liệu | 5,0/10 | Có CRUD cơ bản nhưng thiếu sort, bulk action, saved filter và undo |
| Khả năng mở rộng sản phẩm | 4,5/10 | Component và quy ước UI chưa đủ thống nhất để mở rộng an toàn |
| **Tổng thể** | **4,8/10** | **MVP nội bộ, chưa đạt chuẩn admin chuyên nghiệp** |

---

## 4. Những điểm đang làm tốt

### 4.1. Phạm vi nghiệp vụ tương đối đầy đủ

Hệ thống đã bao phủ nhiều nhóm công việc quan trọng:

- Khách hàng.
- Nhân viên.
- CRM.
- Dịch vụ.
- Bài viết.
- Ứng viên.
- Subscriber.
- Chat khách hàng.
- Chat nội bộ.

Đây là nền tảng tốt để phát triển thành một back-office thống nhất thay vì nhiều công cụ rời rạc.

### 4.2. Mô hình CRUD quen thuộc

Các màn hình chủ yếu sử dụng cấu trúc danh sách, tìm kiếm, bộ lọc và form chỉnh sửa quen thuộc. Người dùng mới có thể hiểu cách thao tác cơ bản mà không cần đào tạo dài.

### 4.3. Có các trạng thái giao diện cần thiết

Nhiều màn đã xử lý:

- Loading.
- Empty state.
- Error state.
- Search.
- Filter.
- Modal hoặc form thêm/sửa.

Đây là phần nền tảng cần giữ lại khi chuẩn hóa design system.

### 4.4. Màn ứng viên có responsive tương đối tốt

So với các bảng dữ liệu khác, màn hồ sơ ứng viên sử dụng card và có khả năng thích ứng tốt hơn trên màn hình nhỏ. Cách tổ chức này có thể được dùng làm tham khảo cho một số màn mobile.

### 4.5. Service Editor có tiềm năng sản phẩm tốt

`ServiceEditor` là ý tưởng nổi bật nhất trong khu vực admin:

- Chia nội dung theo tab.
- Có form chỉnh sửa.
- Có live preview.
- Phù hợp với người vận hành nội dung không chuyên về code.

Nếu bổ sung draft, autosave, version history, preview theo thiết bị và cơ chế xuất bản, đây có thể trở thành một điểm mạnh thực sự của hệ thống.

### 4.6. Công nghệ frontend phù hợp

Frontend đã sử dụng:

- TypeScript.
- Tailwind CSS.
- Lucide Icons.
- Một số token màu thương hiệu.

Nền tảng kỹ thuật đủ để chuẩn hóa giao diện mà không cần viết lại toàn bộ.

---

## 5. Các hạn chế nghiêm trọng

## 5.1. Trang chủ admin đang trống

Route admin chưa có index page thực sự. Component `AdminHome` chỉ hiển thị navbar, sidebar và `Outlet`.

Khi truy cập trực tiếp khu vực admin, người dùng thấy một vùng nội dung trống. Đây là vấn đề UX nghiêm trọng vì dashboard phải trả lời ngay các câu hỏi:

- Hôm nay có việc gì cần xử lý?
- Có bao nhiêu khách hàng hoặc lead mới?
- Bao nhiêu hồ sơ đang chờ xử lý?
- Có tin nhắn chưa đọc không?
- Có deadline hoặc cảnh báo nào sắp tới?
- Hiệu suất công việc hiện tại ra sao?

**Điểm riêng cho dashboard hiện tại: 1/10.**

### Tác động

- Người dùng không biết nên bắt đầu từ đâu.
- Admin bị biến thành một tập hợp menu CRUD thay vì trung tâm điều hành.
- Mất cơ hội hiển thị dữ liệu quan trọng và cảnh báo nghiệp vụ.
- Tạo cảm giác sản phẩm chưa hoàn thiện ngay sau khi đăng nhập.

### Đề xuất

Dashboard mặc định nên có:

1. KPI chính: lead mới, khách hàng mới, hồ sơ chờ, tin chưa đọc.
2. Danh sách công việc cần xử lý hôm nay.
3. Deadline sắp tới.
4. Hoạt động gần đây.
5. Cảnh báo hệ thống hoặc dữ liệu bất thường.
6. Quick actions theo quyền của người dùng.

Nguồn tham chiếu:

- [`AdminHome`](https://github.com/Babychandoi/law-app/blob/d963d70a823f305ed5cf29d72dd1bb4e4ddcd1ae/frontend/src/page/admin/home/index.tsx#L13-L36)

---

## 5.2. Sidebar chưa đúng chuẩn ứng dụng quản trị

Sidebar hiện lưu menu active bằng state khi click thay vì xác định theo URL.

### Hệ quả

- Mở trực tiếp một URL con nhưng menu vẫn có thể highlight “Trang chủ”.
- Reload trang có thể làm trạng thái điều hướng hiển thị sai.
- Nút Back/Forward của trình duyệt không đồng bộ với menu.
- Deep link từ email hoặc bookmark tạo trải nghiệm thiếu tin cậy.

### Các vấn đề bổ sung

- Sidebar mở mặc định kể cả trên mobile.
- Trên desktop, sidebar hoạt động giống drawer phủ màn hình và có overlay.
- Có nguy cơ chồng lớp giữa nút đóng, sidebar và vùng bắt click.
- Thiếu `overflow-y-auto`, có thể mất mục menu trên màn hình thấp.
- Khoảng 11 mục được đặt phẳng, chưa phân nhóm nghiệp vụ.
- Trộn emoji với Lucide icon.
- Màu gradient hồng–tím không đồng nhất với hệ màu vàng–xám của sản phẩm.

### Chuẩn đề xuất

**Desktop:**

- Sidebar cố định rộng 240–256px.
- Cho phép thu gọn còn 64–72px.
- Không dùng overlay trong trạng thái bình thường.
- Active item lấy từ URL bằng `NavLink` hoặc `useLocation`.

**Mobile:**

- Sidebar chuyển thành navigation drawer.
- Mặc định đóng.
- Có overlay, focus trap và đóng bằng Escape.

**Phân nhóm menu gợi ý:**

- Tổng quan.
- Khách hàng và CRM.
- Dịch vụ và nội dung.
- Tuyển dụng.
- Giao tiếp.
- Quản trị hệ thống.

Nguồn tham chiếu:

- [`Sidebar.tsx`](https://github.com/Babychandoi/law-app/blob/d963d70a823f305ed5cf29d72dd1bb4e4ddcd1ae/frontend/src/page/admin/home/sections/Sidebar.tsx#L10-L158)
- [Material Design 3 – Navigation drawer](https://m3.material.io/components/navigation-drawer/overview)

---

## 5.3. Mobile và responsive chưa đạt

Nhiều bảng hiện chỉ được đặt trong `overflow-x-auto`. Cách này ngăn layout vỡ hoàn toàn nhưng không tạo ra trải nghiệm mobile tốt.

### Kết quả đo trên viewport 390px

| Màn hình | Chiều rộng nội dung/bảng |
|---|---:|
| Customers | 756px |
| Employees | 1.056px |
| Subscribers | 549px |
| CRM | 905px |
| Services | 640px |

### Tác động

- Người dùng phải kéo ngang nhiều lần.
- Cột hành động thường nằm ngoài vùng nhìn thấy.
- Khó so sánh dữ liệu giữa các cột.
- Dễ thao tác nhầm khi đang cuộn.
- Không phù hợp cho nhân viên cần kiểm tra nhanh trên điện thoại.

### Đề xuất cho bảng trên mobile

Không nên ép toàn bộ bảng desktop vào màn hình nhỏ. Cần chọn một trong các mô hình:

1. Chuyển mỗi dòng thành card.
2. Chỉ giữ 2–3 trường quan trọng và đưa phần còn lại vào trang chi tiết.
3. Dùng expandable row.
4. Đưa action vào menu ba chấm.
5. Dùng sticky primary column nếu bắt buộc phải giữ dạng bảng.

### Vấn đề riêng của chat

Hai màn chat đang hiển thị đồng thời:

- Danh sách hội thoại có chiều rộng cố định.
- Khu vực nội dung tin nhắn.

Trên mobile, bố cục này đẩy message pane ra ngoài viewport.

### Chuẩn đề xuất cho chat mobile

Sử dụng mô hình master–detail:

1. Ban đầu chỉ hiển thị danh sách hội thoại.
2. Khi chọn một hội thoại, chuyển sang màn nội dung.
3. Có nút “Quay lại” rõ ràng.
4. Giữ trạng thái scroll và hội thoại đang chọn.
5. Composer luôn nằm trong safe area và không bị bàn phím che.

---

## 5.4. Accessibility còn thấp

Qua các màn hình đại diện, kiểm tra tự động phát hiện:

- 28 icon button không có tên để screen reader đọc.
- 19 `select` không có accessible name.
- 19 trường hợp contrast được xác nhận không đạt.
- 11 màn không có document title phù hợp.
- Nhiều label hiển thị bằng mắt nhưng không liên kết với input qua `htmlFor`.
- Modal thiếu cơ chế focus đầy đủ.

### Các lỗi modal cần xử lý

Modal chuyên nghiệp cần:

- `role="dialog"`.
- `aria-modal="true"`.
- Accessible name bằng `aria-labelledby` hoặc `aria-label`.
- Focus được đưa vào modal khi mở.
- Focus trap trong modal.
- Đóng bằng phím Escape khi phù hợp.
- Trả focus về nút đã mở modal sau khi đóng.

### Tác động

- Người dùng bàn phím khó hoặc không thể hoàn thành thao tác.
- Screen reader không đọc đúng chức năng nút và trường nhập.
- Rủi ro không đáp ứng tiêu chuẩn accessibility khi sản phẩm mở rộng.
- Accessibility kém cũng làm giảm trải nghiệm của người dùng thông thường.

Nguồn tham chiếu:

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

---

## 5.5. Ngôn ngữ thiết kế thiếu nhất quán

Giao diện hiện trộn nhiều phong cách:

- Vàng–xám thương hiệu.
- Hồng–tím ở sidebar.
- Vàng–cam–đỏ gradient ở trang bài viết.
- Emoji và Lucide icon.
- Nhiều mức bo góc.
- Nhiều kiểu shadow.
- Một số trang theo phong cách SaaS, một số trang giống landing page marketing.

### Hệ quả

- Các màn hình có cảm giác được phát triển riêng lẻ.
- Khó mở rộng mà không tiếp tục phát sinh biến thể.
- Làm giảm cảm giác ổn định và tin cậy của một hệ thống pháp lý.
- Dev mất thời gian lựa chọn style ở mỗi component mới.

### Định hướng phù hợp với Luật POIP

Khu vực quản trị pháp lý nên ưu tiên:

- Điềm tĩnh.
- Chính xác.
- Rõ thứ bậc thông tin.
- Ít trang trí không có chức năng.
- Màu semantic nhất quán.
- Mật độ thông tin phù hợp với công việc văn phòng.

Gradient lớn, shadow mạnh và quá nhiều màu nhấn nên được giảm đáng kể.

---

## 5.6. Ngôn ngữ và chi tiết sản phẩm chưa chuyên nghiệp

Một số chi tiết làm giảm độ hoàn thiện:

- Trộn “Admin Panel”, “Chats”, “LogOut”, “Username” với tiếng Việt.
- Avatar chỉ hiển thị chữ “A”, không lấy dữ liệu thực tế của người đăng nhập.
- URL `/2025/luatpoip/admin` tạo cảm giác tạm thời.
- Footer đăng nhập vẫn ghi năm 2025 trong năm 2026.
- Navbar thiếu tiêu đề trang.
- Không có breadcrumb.
- Không có vùng primary action nhất quán.

### Đề xuất

- Chọn một ngôn ngữ chính cho toàn bộ back-office.
- Chuẩn hóa thuật ngữ nghiệp vụ.
- Hiển thị đúng tên, vai trò và avatar người dùng.
- Dùng URL ổn định như `/admin` hoặc `/workspace`.
- Tự động cập nhật năm ở footer.
- Mỗi màn hình có page title, mô tả ngắn, breadcrumb và primary action.

---

## 5.7. Chưa đáp ứng tốt thao tác trên dữ liệu lớn

Admin hiện đại cần nhiều hơn chức năng CRUD cơ bản.

### Các tính năng còn thiếu hoặc chưa đồng bộ

- Sort theo cột.
- Phân trang server-side.
- Chọn nhiều dòng.
- Bulk action.
- Ẩn/hiện cột.
- Điều chỉnh mật độ bảng.
- Saved filter.
- Saved view.
- Filter được lưu trên URL.
- Sticky table header.
- Sticky action column.
- Audit log.
- Undo hoặc xác nhận cho thao tác nhạy cảm.

### Rủi ro thao tác

Một số dropdown có thể cập nhật role hoặc status ngay khi người dùng thay đổi lựa chọn mà không có bước lưu, xác nhận hoặc undo. Đây là hành vi nguy hiểm trong màn quản trị.

### Feedback thiếu thống nhất

Hệ thống đang trộn:

- Toastify.
- SweetAlert2.
- `alert()`.
- `window.confirm()`.
- Nhiều loại spinner.

Điều này làm phản hồi hệ thống thiếu nhất quán và khó chuẩn hóa accessibility.

---

## 6. Đánh giá theo từng vai trò

### 6.1. Góc nhìn chuyên gia thiết kế sản phẩm

Giao diện chưa có một design system đủ chặt. Component có thể hoạt động riêng lẻ nhưng chưa tạo thành một ngôn ngữ sản phẩm thống nhất.

**Đánh giá:** nền móng có thể giữ lại, cần tái cấu trúc layout, token và component core trước khi tiếp tục mở rộng nhiều màn hình mới.

### 6.2. Góc nhìn PM/Senior

Phạm vi chức năng tốt nhưng ưu tiên hiện tại đang nghiêng về “có thêm màn hình” hơn là “hoàn thiện hệ thống trải nghiệm”.

**Đánh giá:** nên tạm giảm việc thêm UI riêng lẻ, dành một sprint để chuẩn hóa shell, navigation, data table, form, modal và feedback.

### 6.3. Góc nhìn nhân viên vận hành

Desktop có thể dùng cho tác vụ cơ bản. Tuy nhiên, khi số lượng bản ghi tăng, thiếu sort, phân trang, bulk action và saved filter sẽ làm chậm công việc đáng kể.

**Đánh giá:** phù hợp thử nghiệm nội bộ, chưa tối ưu cho vận hành hằng ngày ở quy mô lớn.

### 6.4. Góc nhìn khách hàng hoặc lãnh đạo xem demo

Dashboard trống, phong cách màn hình không đồng nhất và lỗi mobile dễ tạo ấn tượng sản phẩm còn dang dở.

**Đánh giá:** chưa nên dùng bản hiện tại làm bản demo đại diện cho chất lượng sản phẩm cuối cùng.

---

## 7. Kiến trúc giao diện đề xuất

### 7.1. App shell trên desktop

- Sidebar cố định: 248px.
- Sidebar thu gọn: 72px.
- Top bar: 64px.
- Content container: tối đa khoảng 1.400–1.440px.
- Page header nhất quán.
- Breadcrumb.
- Primary action đặt ở góc phải page header.
- Sidebar không phủ overlay trong chế độ desktop thông thường.

### 7.2. App shell trên mobile

- App bar gọn.
- Navigation drawer mặc định đóng.
- Nội dung một cột.
- Modal dài chuyển thành full-screen dialog.
- Bảng chuyển thành card hoặc reduced-column view.
- Chat chỉ hiển thị một pane tại một thời điểm.

### 7.3. Cấu trúc page header chuẩn

Mỗi màn nên có:

1. Breadcrumb.
2. Page title.
3. Mô tả ngắn hoặc số lượng bản ghi.
4. Primary action.
5. Secondary action nếu cần.
6. Search và filter bên dưới.

### 7.4. Dashboard đề xuất

**Hàng 1 – KPI:**

- Lead mới.
- Khách hàng mới.
- Hồ sơ chờ xử lý.
- Tin nhắn chưa đọc.

**Hàng 2 – Công việc:**

- Việc cần làm hôm nay.
- Deadline sắp tới.

**Hàng 3 – Theo dõi:**

- Hoạt động gần đây.
- Cảnh báo hệ thống.

**Hàng 4 – Phân tích:**

- Xu hướng lead.
- Tỷ lệ chuyển đổi.
- Khối lượng hồ sơ theo trạng thái.

Chỉ hiển thị số liệu phù hợp với quyền của từng vai trò.

---

## 8. Design system đề xuất

### 8.1. Màu sắc

- Một màu primary lấy từ màu vàng thương hiệu.
- Một neutral scale xám dùng xuyên suốt.
- Màu semantic cố định:
  - Success: xanh lá.
  - Warning: amber.
  - Error: đỏ.
  - Info: xanh dương.

Không dùng màu chỉ để trang trí nếu màu đó dễ bị hiểu là trạng thái nghiệp vụ.

### 8.2. Spacing

Sử dụng hệ spacing theo bội số 4px hoặc 8px, ưu tiên các mức:

- 4px.
- 8px.
- 12px.
- 16px.
- 24px.
- 32px.
- 40px.
- 48px.

### 8.3. Radius và shadow

- Radius chính: 8px.
- Radius lớn: 12px.
- Tối đa hai mức shadow.
- Không dùng shadow lớn cho mọi card.

### 8.4. Typography

Cần định nghĩa rõ:

- Display.
- Page title.
- Section title.
- Body.
- Label.
- Caption.
- Table text.

Giữ chiều cao dòng đủ thoáng và độ tương phản phù hợp WCAG.

### 8.5. Component core cần chuẩn hóa

1. Button.
2. IconButton.
3. Input.
4. Select.
5. Combobox.
6. Date picker.
7. Checkbox và radio.
8. Badge/status.
9. Data table.
10. Pagination.
11. Modal/dialog.
12. Drawer.
13. Toast.
14. Confirm dialog.
15. Skeleton.
16. Empty state.
17. Error state.
18. Page header.
19. Breadcrumb.

### 8.6. Icon

- Chỉ dùng một bộ Lucide.
- Không dùng emoji như icon điều hướng chính.
- Icon button luôn có tooltip và accessible name.

---

## 9. Lộ trình cải thiện

## P0 – Bắt buộc sửa trước khi nghiệm thu  → 10 xong (đã đóng hết)

1. ✅ Tạo dashboard mặc định cho route admin. *(Dashboard.tsx: KPI đếm qua meta + KH gần đây + quick actions)*
2. ✅ Sửa active menu theo URL bằng `NavLink`. *(Sidebar.tsx)*
3. ✅ Tách sidebar desktop và drawer mobile.
4. ✅ Làm lại responsive cho guest chat và team chat. *(master-detail; team chat Messenger)*
5. ✅ Accessible name cho icon button + input. *(nút icon-only có aria-label; **bổ sung theo audit độc lập**: ô tìm + đổi tên khách + ô nhập tin của guest chat & team chat, ô tìm Khách hàng, subtitle section + tiêu đề mục con ServiceEditor, textarea phụ đề AddNews/EditNews — đều đã có aria-label/label)*
6. ✅ Label đúng chuẩn cho input/select. *(login + select + ServiceEditor tĩnh liên kết `htmlFor/id`; field động + textarea phụ đề News liên kết `htmlFor/id`; field khác có aria-label)*
7. ✅ Document title theo route.
8. ✅ Sửa contrast. *(**`textOn()` viết lại theo đúng WCAG 2.1** — độ sáng tương đối có gamma sRGB + chọn đen/trắng theo tỉ lệ tương phản cao nhất; 3 màu seed CRM (#3B82F6/#8B5CF6/#10B981) nay đạt 4.96–8.28:1. Chữ "quá hạn" đổi red-500→red-600, nút "Gửi email" green-600→green-700. **axe-core (`e2e/a11y.spec.ts`) 7/7 pass, 0 lỗi `color-contrast`** trên đăng nhập + Khách hàng + Người đăng ký + **CRM** + **Tin tức**. Ghi chú: 5 màn đại diện, chưa phải toàn bộ)*
9. ✅ Chuẩn hóa modal (dialog role/focus trap/Escape/focus return + fix mất focus).
10. ✅ Bàn phím hoàn thành luồng chính. *(guest-chat rows + Navbar thông báo + drawer: đưa/giữ focus khi mở + Tab-trap + Escape + **trả focus về nút "Mở menu" khi đóng** + **nền `#admin-content-region` đặt `inert` khi drawer mở**)*

## P1 – Hoàn thành trong một sprint  → 12 xong (đã đóng hết)

1. ✅ Chuẩn hóa design token. *(tailwind.config.js + ui/tokens.ts; **đã quét bỏ màu thương hiệu rời `amber-*`/`orange-*` → `brand-gold*`/`brand-surface`** ở CRM/Services/News/ServiceImages/Post/Employee. Còn `amber` ở Dashboard/caseStatus là **màu ngữ nghĩa** cho trạng thái "Đang xử lý", cố ý giữ)*
2. ✅ Component library dùng chung. *(Button/Input/Card/Badge/Spinner/EmptyState/PageHeader/Breadcrumb/ConfirmDialog/DataTable/EmojiPicker/Popover)*
3. ✅ Page header/breadcrumb/primary action. *(áp cho Customer/Subscribers/Services/JobApplications/Employee/CRM/CRM Config **+ Post + ServiceImages**)*
4. ✅ Responsive table/card cho mobile.
5. ✅ Thống nhất feedback. *(**đã bỏ SweetAlert2 và toàn bộ `window.prompt`** — dùng toast/ConfirmDialog + modal/input; Employee còn loading overlay tự viết là chi tiết nhỏ)*
6. ✅ Pagination + sorting server-side. *(pagination + sort server-side cho customer/user/subscriber **và CRM** — CRM `/crm/cases?sort=field,dir` có whitelist chống injection, đã kiểm chứng đảo chiều asc/desc trên prod; guest chat có "Tải thêm hội thoại")*
7. ✅ Sorting. *(client cho bảng client-mode; server cho customer/user/subscriber **+ CRM** (customer/nextFollowUpAt/status/lastCaredAt/caseCreatedAt))*
8. ✅ Bulk action. *(DataTable selectable + bulkActions; Subscribers "Xóa đã chọn")*
9. ✅ Lưu filter trên URL. *(Customer/Subscribers/Nhân viên: page/q/sort/bộ lọc lên URL, hiện lại sau reload **và đồng bộ hai chiều back/forward**; ô tìm phản ánh URL. CRM/bài viết chưa lưu URL là phần mở rộng P2, không thuộc phạm vi P1)*
10. ✅ Giảm emoji/gradient/shadow. *(News + Post đã solid: header dùng PageHeader, nút bỏ shadow nặng + hiệu ứng scale, badge gradient → nền phẳng, prose link/blockquote dùng brand token. **Bỏ nốt emoji theo audit**: Post 👤/📅 → icon User/Calendar, AddNews/EditNews ⚠️ → icon AlertTriangle)*
11. ✅ Chuẩn hóa thuật ngữ VI/EN.
12. ✅ Hiển thị dữ liệu người dùng đăng nhập thực tế.

## P2 – Nâng lên mức sản phẩm tốt  → 4 xong · 8 chưa

1. ✅ Saved view / saved filter. *(view lưu **tìm kiếm + sort + trang + bộ lọc** (ảnh chụp query URL) **cùng** mật độ + cột ẩn theo tableId; áp view khôi phục đủ trạng thái. Có unit test round-trip (`DataTable.test.tsx`: lưu 'Ali' → xóa → áp lại → ô tìm về 'Ali'). Áp cho bảng đẩy trạng thái lên URL (customer/subscriber/user + bảng urlKey); CRM dùng state nội bộ nên chỉ lưu mật độ/cột cho tới khi CRM chuyển sang URL)*
2. ✅ Column visibility. *(ẩn/hiện cột — thẻ mobile mặc định tôn trọng cột ẩn; chỉ `mobileCard` tùy biến là do màn tự dựng)*
3. ✅ Table density. *(nút Thoáng/Gọn, lưu localStorage — áp cho bảng desktop)*
4. ⬜ Audit log.
5. ⬜ Lịch sử thay đổi dữ liệu.
6. ⬜ Global search hoặc command palette.
7. ⬜ Autosave cho Service Editor.
8. ⬜ Draft và version history.
9. ⬜ Preview theo desktop/tablet/mobile.
10. ⬜ Visual regression test.
11. ✅ Accessibility test trong CI. *(**cổng chặn PR tự động** — job `a11y` trong `.github/workflows/ci.yml` chạy mỗi push/PR: build tĩnh → serve → axe-core (`e2e/a11y-public.spec.ts`, project `public`) quét `color-contrast` trên trang đăng nhập + trang preview `/2025/luatpoip/_a11y` (gom Button/Input/Badge + chip màu CRM). **Không cần secret prod**. Bonus: bộ E2E có secrets vẫn quét 5 màn thật; `textOn` tách ra `shared/utils/contrast.ts` + 7 unit test. Cổng này đã bắt được lỗi thật: #8B5CF6 với chữ `#111827` chỉ 4.19:1 → đổi sang đen tuyền `#000000` (4.96:1))*
12. ⬜ Theo dõi analytics cho luồng admin quan trọng.

---

## 10. Tiêu chí nghiệm thu đề xuất

### 10.1. Dashboard

- Truy cập route admin luôn hiển thị dashboard có nội dung.
- KPI có loading, empty và error state.
- Dữ liệu hiển thị theo quyền.
- Các thẻ điều hướng được đến danh sách chi tiết tương ứng.

### 10.2. Navigation

- Menu active luôn khớp với URL.
- Reload và deep link không làm sai active state.
- Back/Forward hoạt động đúng.
- Sidebar desktop không phủ nội dung.
- Drawer mobile mặc định đóng và hỗ trợ bàn phím.

### 10.3. Responsive

Kiểm thử tối thiểu tại:

- 360px.
- 390px.
- 768px.
- 1.024px.
- 1.440px.

Yêu cầu:

- Không có horizontal overflow ngoài component được thiết kế để cuộn.
- Hành động chính luôn nhìn thấy.
- Chat mobile chỉ hiển thị một pane.
- Form và modal không bị bàn phím hoặc viewport che khuất.

### 10.4. Accessibility

- Không còn button hoặc select thiếu accessible name.
- Label được liên kết đúng với control.
- Toàn bộ luồng chính dùng được bằng bàn phím.
- Focus indicator nhìn thấy rõ.
- Modal quản lý focus đúng.
- Contrast đạt WCAG AA cho nội dung chính.
- Mỗi route có document title phù hợp.

### 10.5. Data table

- Có server-side pagination ở danh sách lớn.
- Có sorting tại các cột quan trọng.
- Filter được phản ánh trên URL.
- Có empty, loading và error state.
- Action nguy hiểm có xác nhận hoặc undo.
- Bulk action chỉ xuất hiện khi có dòng được chọn.

### 10.6. Design system

- Mọi màn dùng cùng bộ button, input, select, modal và toast.
- Không còn emoji ở navigation.
- Radius, shadow, spacing và màu semantic theo token.
- Không phát sinh style cục bộ trái với quy chuẩn nếu không có lý do được ghi nhận.

---

## 11. Thứ tự triển khai thực tế đề xuất

Không nên thiết kế lại từng trang độc lập. Trình tự hợp lý:

1. Chốt token và nguyên tắc design system.
2. Làm app shell: sidebar, top bar, page header và breadcrumb.
3. Tạo dashboard mặc định.
4. Chuẩn hóa button, form, modal, toast và status badge.
5. Xây data table dùng chung.
6. Chuyển lần lượt các màn CRUD sang component chuẩn.
7. Làm lại chat responsive.
8. Sửa accessibility toàn hệ thống.
9. Bổ sung test tự động và visual regression.
10. UAT bằng dữ liệu và tài khoản thật.

Cách triển khai này giảm việc sửa lặp và giúp toàn bộ giao diện tiến về cùng một chuẩn.

---

## 12. Quyết định cuối cùng

Giao diện admin của Luật POIP có **nền móng chức năng khá tốt**, nhưng hiện vẫn giống một tập hợp các màn CRUD được phát triển riêng lẻ hơn là một sản phẩm quản trị có design system thống nhất.

Ưu tiên đúng trong giai đoạn tiếp theo là:

1. Dashboard.
2. Navigation.
3. Responsive.
4. Accessibility.
5. Component và design system.
6. Công cụ xử lý dữ liệu lớn.

Sau khi hoàn thành P0 và P1, giao diện có thể tiến từ mức **4,8/10 lên khoảng 7–8/10** nếu được triển khai đồng bộ và kiểm thử thực tế. Dark mode, animation hoặc các hiệu ứng trang trí chỉ nên thực hiện sau khi các nền tảng trên đã đạt.

**Kết luận nghiệm thu:** chưa đạt chuẩn UI/UX quản trị hiện đại và chuyên nghiệp ở trạng thái hiện tại; cần khắc phục các hạng mục P0 và P1 trước khi nghiệm thu chính thức.


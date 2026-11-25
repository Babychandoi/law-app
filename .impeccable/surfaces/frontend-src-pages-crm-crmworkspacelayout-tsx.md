---
version: 1
slug: "frontend-src-pages-crm-crmworkspacelayout-tsx"
primary_target: "frontend/src/pages/crm/CrmWorkspaceLayout.tsx"
related_targets: ["frontend/src/features/crm"]
---

# CRM Workspace Surface Brief

- **Scope:** `/2025/luatpoip/crm/*` (`KH Liên hệ`, `Khách hàng`, `Cơ hội HĐ`, `Hợp đồng`)
- **Mode:** Operate
- **Audience & Job:** Luật sư, chuyên viên sở hữu trí tuệ/pháp lý và quản trị viên Luật Poip Legal vận hành toàn bộ vòng đời khách hàng hàng ngày từ tiếp nhận liên hệ, chăm sóc 360°, theo dõi 7 giai đoạn tư vấn hồ sơ đến ký kết hợp đồng và quản lý thu chi/lãi lỗ.
- **Constraints:** Kế thừa bảng màu chuẩn `DESIGN.md` (`#0f766e` Primary Teal, `#1b2a3a` Ink, `#d8e6e1` Line, `#f1f8f6` Surface, `#f5b32d` Accent, `Be Vietnam Pro`), không gradient, không banner quảng cáo AI, số liệu `tabular-nums`, WCAG 2.1 AA.

## Direction contract

THESIS: Không gian vận hành CRM pháp lý mật độ cao theo bố cục 4 vùng chuẩn MISA AMIS CRM nhưng mang bản sắc phẳng, điềm tĩnh và rõ ràng của Luật Poip Legal; từ chối các thẻ KPI rườm rà, gradient màu mè và popup gián đoạn không cần thiết.

OWN-WORLD: Nền làm việc `#f1f8f6` tách biệt thẻ bảng trắng `#ffffff` viền `1px solid #d8e6e1`, thanh điều hướng thu gọn `64px` mở rộng `216px` nền `#1b2a3a`, nút hành động chính `#0f766e`, chữ số `tabular-nums`, trạng thái phân biệt bằng nhãn súc tích và tương phản chuẩn AA.

STORY: Chuyên viên nhìn thấy ngay danh sách hồ sơ/hợp đồng được ghim cột mã và thao tác, lọc nhanh ở thanh phải mà không rời bảng, chuyển đổi mượt từ KH Liên hệ sang Khách hàng, kéo/chuyển Cơ hội qua 7 bước tư vấn pháp lý và kiểm soát tức thời Thực thu, Còn phải thu, Dự kiến lãi lỗ ở chân trang Hợp đồng.

FIRST VIEWPORT: Thanh đầu trang `48px` có chuyển khu vực Vận hành và tìm kiếm nhanh; cột trái thu gọn `64px` gồm đúng 4 phân hệ trọng tâm; vùng chính mở thanh tiêu đề `56px` (chọn chế độ xem, Nhập Excel, nút `+ Thêm` màu `#0f766e` góc phải) ngay trên thẻ bảng trắng cuộn ngang ghim cột trái/phải và thanh tổng hợp KPI cố định đáy `48px`; khung lọc `260px` neo bên phải khi bật.

FORM: `seed: none (pinned)` — "Khu làm việc CRM chuyên biệt tại /2025/luatpoip/crm/* (bố cục giống MISA: sidebar thu gọn 4 phân hệ, bảng rộng cuộn ngang ghim cột, bộ lọc neo phải; mở từ menu Vận hành)" và "Giữ bố cục & trải nghiệm MISA AMIS CRM nhưng dùng tông màu chuẩn Luật Poip (Xanh ngọc #0f766e, phẳng, sạch theo DESIGN.md, lược bỏ các banner gợi ý AI rườm rà)".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

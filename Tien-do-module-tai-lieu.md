# Tiến độ hoàn thiện module Quản lý tài liệu (theo báo cáo đánh giá)

> Nguồn: `Bao-cao-danh-gia-module-Quan-ly-tai-lieu-Luat-POIP.md` (baseline commit `d963d70`, 26/07/2026).
> Ghi chú trung thực: nhiều mục đã được đóng ở các phiên trước; đối chiếu bằng **đọc code + test thật**,
> không tin baseline của báo cáo. ✅ xong · ⚠️ một phần · ⬜ chưa · 🚫 hạ tầng/ops ngoài phạm vi code thuần.

## P0 — Trước khi nghiệm thu
- ✅ 8.1 Chống mất dữ liệu khi Publish (save+publish nguyên tử: `PublishTemplateRequest`).
- ✅ 8.2 Phiên bản mẫu bất biến (`DocumentTemplateVersion` + `DocumentTemplateVersionManager`; tài liệu trỏ version).
- ✅ 8.3 Chặn publish mẫu không hợp lệ (`validateForPublish`: khớp placeholder↔schema, trial render).
- ✅ 8.4 Placeholder đáng tin cậy (cross-run, đếm số lần, không replace-all mù; **header/footer đã được duyệt qua `findTextBlocks` mọi part**).
- ✅ 8.5 Test tài liệu thực tế (bảng, split-run, unicode VN, list; `DocxTemplateEngineTest`/`...ListTest`).
- ✅ 8.6 Bảo vệ dữ liệu & tài nguyên (phân trang; encrypt PII `SensitiveValueEncryptionService`; malware scanner ICAP; **zip-bomb ratio + chặn external relationship** trong `validatePackage`; compensation xóa file rác khi lỗi).
  - ✅ Job dọn file rác định kỳ (`DocumentStorageReconciliationService` @Scheduled: xóa orphan cũ hơn ân hạn, giữ file tham chiếu + orphan mới; cấu hình `document.reconciliation.*`).

## P1 — Tự động hóa tài liệu dịch vụ
1. ✅ Gắn mẫu với dịch vụ (`serviceId`/`serviceName`).
2. ✅ Gắn tài liệu với KH + CRM case (`LegalDocumentContext`).
3. ✅ Tự điền dữ liệu KH/DN (`buildCrmPrefill`).
4. ✅ Chỉ hỏi dữ liệu còn thiếu — form tạo tài liệu chỉ hiện trường còn trống; trường đã tự-điền (prefill/mặc định) gom vào mục "Đã tự điền N trường" có thể mở để sửa; tự mở khi có lỗi ở nhóm đó.
5. ✅ Tạo nhiều tài liệu một lần (bộ mẫu) — backend (`DocumentBundle` + CRUD + generate cả bộ) **+ UI**: trang Bộ mẫu (danh sách/tạo/sửa/lưu trữ, chọn mẫu có thứ tự) + trang Tạo hồ sơ (dữ liệu dùng chung = hợp field các mẫu → sinh cả bộ, kết quả per-item + tải).
6. ✅ Trường lặp (`${list__child}` + `renderWithLists` + form thêm/bớt dòng).
7. ✅ Điều kiện — hiện/ẩn đoạn theo dữ liệu (`${if_KEY}..${endif_KEY}`, lồng nhau; publish validate).
8. ✅ Định dạng ngày VN + số tiền bằng chữ (`VietnameseDate` `_vi`, `VietnameseNumberWords` `_bangchu`).
9. ✅ Validation nghiệp vụ (EMAIL/PHONE/TAX_ID/NATIONAL_ID/SELECT/MULTISELECT/PERCENT/CURRENCY/DATE/NUMBER).
10. ✅ Quy trình Draft/Review/Approve/Final (`DocumentWorkflowStatus`).
11. ✅ Audit log (`DocumentAuditService`).
12. ✅ Tích hợp app shell admin — `DocumentLayout` dùng chung `Sidebar`/`Navbar`/`CommandPalette` (OPERATIONS_GROUPS) của admin; sidebar có mục "Tài liệu & biểu mẫu" → `/2025/luatpoip/tai-lieu` (navConfig).

## P2 — Sản phẩm chuyên nghiệp
1. ⚠️ Sinh PDF — **code xong, flag OFF**: `GET /documents/generated/{id}/pdf` qua Gotenberg (LibreOffice headless HTTP, không bloat image); nút "Tải PDF" ở form tạo tài liệu. Bật: chạy service `gotenberg` (đã thêm vào compose) + `DOCUMENT_PDF_ENABLED=true`.
2. 🚫 Ký số. 3. ⚠️ Gửi email — **code xong, flag OFF**: `POST /documents/generated/{id}/email` gửi LINK chia sẻ bảo mật (không đính kèm file nhạy cảm) qua SMTP; nút "Gửi email" ở màn tạo tài liệu. Bật: `DOCUMENT_MAIL_ENABLED=true` + `MAIL_*` (SMTP) + `DOCUMENT_SHARE_PUBLIC_BASE_URL`. 4. ✅ Chia sẻ bảo mật cho KH — link token băm (SHA-256), hạn dùng + giới hạn lượt tải + thu hồi; endpoint công khai `GET /documents/shared/{token}` (permitAll); nút "Tạo link chia sẻ" ở màn tạo tài liệu.
5. ✅ Thư viện điều khoản (MVP) — kho đoạn văn tái dùng (tiêu đề/nội dung/nhóm/tag), CRUD + tìm kiếm + copy nội dung; trang `/tai-lieu/clauses`; kết hợp `${if_KEY}` để bật/tắt. 6. ⚠️ Rule engine — chưa làm engine luật đầy đủ (điều kiện `${if_}` + thư viện điều khoản đã phủ nhu cầu cơ bản).
7. ⚠️ So sánh phiên bản (có version; chưa có diff UI). 8. ✅ Khôi phục phiên bản (`RestoreVersionRequest`).
9. ✅ Search metadata (mẫu: name/description/serviceName/tags; tài liệu: theo trạng thái/case/customer/service) — regex substring, hợp tiếng Việt; values mã hóa nên không search nội dung (đúng thiết kế bảo mật). 10. ⚠️ Folder/tag (tag có; folder chưa).
11. ⬜ Retention policy. 12. 🚫 Background queue (đồng bộ hiện đủ tải nội bộ).
13. ✅ Antivirus (ICAP scanner, fail-closed cấu hình được). 14. 🚫 Observability. 15. 🚫 Backup/restore.
16. ✅ Dashboard khối lượng tài liệu — backend `GET /documents/stats` + **trang Tổng quan** (KPI + phân bố trạng thái mẫu/tài liệu + quick links) tại `/tai-lieu/dashboard`. 17. ⬜ SLA + cảnh báo job lỗi.

## Thứ tự loop dự kiến (mục code khả thi, giá trị cao trước)
1. P1.7 Điều kiện hiện/ẩn đoạn ← đang làm.
2. P0.6 Job dọn file rác định kỳ.
3. P1.5 Bộ mẫu / tạo nhiều tài liệu.
4. P2.11 Retention policy + không ghi PII vào log (rà soát).
5. P2.9 Full-text search mẫu/tài liệu.
6. P2.16 Dashboard khối lượng tài liệu.
7. P2.3/2.4 Gửi email / chia sẻ bảo mật (nếu có hạ tầng mail).
8. P2.1 Sinh PDF (nếu chấp nhận thêm dependency).

Các mục 🚫 (ký số, backup/restore, observability, background queue) là hạ tầng/ops — sẽ nêu rõ, không tự ý dựng.

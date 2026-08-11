# Trạng thái triển khai nền tảng quản lý và tự động hóa pháp lý

## 1. Phạm vi đối chiếu

Tài liệu này đối chiếu:

- báo cáo `Bao-cao-danh-gia-module-Quan-ly-tai-lieu-Luat-POIP.md` ngày 26/07/2026;
- source hiện tại ngày 29/07/2026, HEAD `478cdb8d7` cộng các thay đổi chưa commit trong worktree;
- kiến trúc đích tại
  [LEGAL-AUTOMATION-ARCHITECTURE.md](./LEGAL-AUTOMATION-ARCHITECTURE.md);
- yêu cầu vận hành tại
  [LEGAL-AUTOMATION-OPERATIONS.md](./LEGAL-AUTOMATION-OPERATIONS.md).

Đây là **snapshot đọc source**, không phải biên bản nghiệm thu. `document-service` và frontend đang
được hoàn thiện; phải cập nhật lại ma trận sau merge và CI cuối. Sự tồn tại của một file test không
đồng nghĩa test đã chạy xanh trên artifact production.

## 2. Quy ước

| Trạng thái | Ý nghĩa |
|---|---|
| **Implemented** | Luồng chính đã có trong source và có bằng chứng test/source phù hợp; vẫn cần CI/UAT. |
| **Partially implemented** | Có nền tảng hoặc một phần luồng nhưng chưa đạt toàn bộ tiêu chí nghiệm thu. |
| **External/production dependency** | Cần hạ tầng, nhà cung cấp, credential, quy trình hoặc bằng chứng production bên ngoài repository. |
| **Not implemented** | Không thấy API/domain/worker/UI đáp ứng năng lực trong source hiện tại. |

## 3. Kết luận ngắn

- **P0:** phần lớn rủi ro mất thay đổi, version, placeholder, validation, mã hóa, giới hạn DOCX và
  scanner fail-closed đã được harden ở mức code/Compose. Chưa đủ đóng P0 production do thiếu golden
  corpus/UAT Word, quarantine/CDR, xác minh vận hành signature scanner, orphan reconciliation,
  migration production và restore drill.
- **P1:** đã có metadata service/matter, CRM party, workflow cơ bản và audit; chưa có server-side data
  resolution, service package, sinh bộ tài liệu, repeated/conditional section hoặc background job.
- **P2:** restore version và metadata search đã có một phần. PDF/A, ký số/e-sign, email phát hành pháp
  lý, secure client sharing, retention/legal hold và rule engine chưa có.
- Không có căn cứ để tuyên bố hệ thống đạt ISO hoặc “tiêu chuẩn thế giới” chỉ từ source hiện tại.

## 4. Ma trận P0

| Hạng mục báo cáo | Trạng thái | Bằng chứng source/API/test | Giới hạn còn lại |
|---|---|---|---|
| Lưu bản nháp và publish không mất thay đổi | **Implemented** | `PUT /documents/templates/{id}/publish` nhận toàn bộ fields/metadata + `expectedRevision`; [template service], [field editor], [publish test], [editor test]. | “Atomic” ở mức command/optimistic concurrency; Mongo version, aggregate, audit và MinIO không nằm trong một distributed transaction. |
| Phiên bản mẫu thật, tài liệu pin đúng version | **Implemented** | [template version], [version manager], [generated document]; API versions/preview/restore tại [template controller]; [publish test]. | Bất biến được thực thi ở application layer, chưa phải WORM/DB policy; chưa có test integration restore + generated document lịch sử. |
| Chặn publish mẫu không hợp lệ | **Implemented** | Schema bắt buộc có field/key duy nhất, placeholder phải khớp, trial render và parse lại tại [template service], [value validator]; `POST /{id}/dry-run`; [validator test]. | Dry-run UI chưa được nối; API chỉ trả valid/size/hash, chưa cho người dùng xem output thử. |
| Placeholder xuyên Word run, không thay mơ hồ | **Partially implemented** | [DOCX engine] xử lý paragraph qua nhiều run/part, đếm occurrence và từ chối literal mơ hồ; [DOCX test] có paragraph, table, header/footer, split run, Unicode và text lặp. | Chưa có corpus thật cho textbox, hyperlink, tracked changes, field code, footnote/endnote và nhiều biến thể Word/Office. |
| Regression test tài liệu thực tế | **Partially implemented** | [DOCX test], [publish test], [validator test], [workflow test], [encryption test]. | Test chủ yếu sinh DOCX nhân tạo; chưa đủ ảnh, bold/italic phức tạp, file khách hàng thực đã khử định danh, visual diff và mở bằng Microsoft Word/LibreOffice. |
| Bảo vệ dữ liệu/tài nguyên | **Partially implemented** | Page APIs, input/ZIP limits, external/OLE/macro guard, SHA-256, AES-GCM, compensation khi metadata save lỗi; scanner ClamAV INSTREAM fail-closed và Compose private runtime; [template service], [generated service], [malware scanner], [encryption test]. | Chưa có quarantine/scan-state/promotion, CDR, scheduled orphan cleanup/integrity reconciliation, HA hoặc evidence EICAR/signature-age vận hành. |

### Nền tảng bổ sung đã có

| Năng lực | Trạng thái | Bằng chứng |
|---|---|---|
| Mã hóa input sinh tài liệu, key rotation read-path | **Implemented** | [encryption service], [encryption test]; dữ liệu mới để `values` rỗng và lưu AES-256-GCM kèm `keyId`. |
| PII matter party, key rotation và soft archive | **Implemented** | `GET/POST/PUT/DELETE /crm/cases/{caseId}/parties`; AES-GCM envelope v2 có key ID, key ring bounded và dual-read v1/v2; [party controller], [party cipher], [party cipher test], [party tests]. |
| Event case đáng tin cậy | **Implemented** | Transactional outbox/publisher confirm, CRM inbox chống trùng và DLQ; [outbox dispatcher], [case listener], [case event tests]. |
| Download qua API và response hardening | **Implemented** | `GET /documents/generated/{id}/download`, authorization/audit; [generated service], [gateway filter], [gateway test]. |
| Generation idempotency + checksum | **Partially implemented** | `Idempotency-Key`, request fingerprint, unique scope và SHA-256 tại [generated service]/[generated document]. | Chưa có integration/concurrency test riêng và chưa áp dụng cho generation package/background job. |

## 5. Ma trận P1 — Tự động hóa tài liệu dịch vụ

| Hạng mục báo cáo | Trạng thái | Bằng chứng hiện có | Phần thiếu |
|---|---|---|---|
| Gắn mẫu/bộ mẫu với dịch vụ | **Partially implemented** | Template/version có `serviceId`, `serviceName`, tags và filter; [template version], `GET /documents/templates/page`. | Chưa có `ServicePackage`/package version, rule chọn mẫu, thứ tự và input schema chung. |
| Gắn tài liệu với khách hàng/CRM case | **Partially implemented** | [legal context] lưu/index/filter `crmCaseId`, `customerId`, `serviceId`, dossier/matter reference; CRM có `GET /crm/cases/{id}` và party API. | Context do caller gửi; document-service chưa resolve/authorize context trực tiếp từ CRM hoặc pin source revision. |
| Tự điền dữ liệu CRM/doanh nghiệp | **Not implemented** | Frontend chỉ truyền query/context IDs vào [generate page]. | Không có CRM client/data-resolution API hay binding field → authoritative source. |
| Chỉ hỏi dữ liệu còn thiếu | **Partially implemented** | [value validator] áp default và báo required/unknown key; form hiển thị validation. | Không merge dữ liệu nhiều nguồn, provenance, conflict/missing-field set hoặc workflow `AWAITING_INPUT`. |
| Tạo nhiều tài liệu trong một lần | **Not implemented** | Generation hiện là `POST /documents/templates/{templateId}/generate`, một template/một DOCX. | Chưa có package, generation job, partial result hay retry từng item. |
| Trường/dòng lặp | **Not implemented** | `MULTISELECT` chỉ chuẩn hóa danh sách chuỗi. | Không render repeated row/table/party/author/product group. |
| Điều khoản/section có điều kiện | **Not implemented** | Engine hiện thay placeholder text. | Không có expression/conditional section hoặc policy sandbox. |
| Ngày, số tiền, tiền bằng chữ | **Partially implemented** | [value validator] kiểm tra ISO date, number, currency, percent, min/max. | Không format ngày tiếng Việt, locale tiền tệ, VAT/tổng phí hay chuyển số tiền thành chữ. |
| Validation nghiệp vụ | **Partially implemented** | Email, phone, tax/national ID, regex, select, min/max và giới hạn tổng input; [validator test]. | Không có cross-field, jurisdiction, service rule hoặc kiểm chứng nguồn. |
| Draft → review → approve → final | **Partially implemented** | [workflow status], `PUT /documents/generated/{id}/workflow`; chống self-approval cơ bản và optimistic revision; [workflow test]. | Chưa có approval task nhiều cấp, due date/SLA, comment, delegation, issued state, qualified signature hay approval pin riêng theo rendition. |
| Audit log | **Partially implemented** | Template/generated/download/access-denied/workflow audit; party audit không PII; `/audit` endpoints; [audit service]. | Chưa tamper-evident/WORM, central SIEM, export/evidence chain và coverage mọi bounded context. |
| Tích hợp app shell admin | **Implemented** | Shared Sidebar/Navbar/CommandPalette tại [document layout], nav “Tài liệu & biểu mẫu” tại [nav config]. | Cần authenticated browser UAT và axe cho chính module tài liệu. |

## 6. Ma trận P2 — Sản phẩm chuyên nghiệp

| Năng lực | Trạng thái | Bằng chứng/kết luận |
|---|---|---|
| Sinh PDF và PDF/A | **Not implemented** | Không có renderer PDF, profile PDF/A, font embedding, validator như veraPDF hoặc rendition metadata. DOCX parse thành công không phải PDF/A. |
| Ký số/e-sign | **Not implemented** | Không có signature domain/API/provider, certificate/HSM/TSA, consent/evidence hoặc validation chữ ký. |
| Gửi email pháp lý | **Not implemented** | Backend có mail cho chức năng khác không đồng nghĩa phát hành tài liệu; không có document dispatch API, recipient approval, DKIM/DMARC evidence hay delivery/bounce audit. |
| Chia sẻ bảo mật cho khách hàng | **Not implemented** | Chỉ có staff-authenticated download; không có portal, expiring grant, recipient verification, watermark hoặc revokeable share. |
| Thư viện điều khoản và rule engine | **Not implemented** | Không có clause/rule domain, versioning, sandbox hoặc decision trace. |
| So sánh phiên bản | **Not implemented** | Có list/preview từng version nhưng không có semantic/text/visual diff. |
| Khôi phục phiên bản | **Implemented** | `POST /documents/templates/{id}/versions/{versionId}/restore` tạo draft/version mới; không mở khóa version cũ; [template service], [field editor]. |
| Full-text search | **Partially implemented** | Có regex metadata search và page/filter ở template/generated. | Không index nội dung DOCX, OCR, Vietnamese analyzer, permission-aware search hoặc saved view. |
| Folder và tag | **Partially implemented** | Template có tags. | Không có folder/matter tree, document tags, bulk action hoặc inheritance ACL. |
| Retention, legal hold, disposition | **Not implemented** | `DataClassification` mới là metadata; chưa có schedule/assignment/hold/disposition API hoặc enforcement. |
| Background generation queue | **Not implemented** | Sinh DOCX vẫn đồng bộ trong request. Rabbit/outbox hiện phục vụ case event, không phải generation job. |
| Antivirus runtime | **Partially implemented** | Có [malware scanner] ClamAV INSTREAM và [malware test]; production Compose khởi tạo `clamav/clamav:1.5.2_base`, volume signature private và document-service bật fail-closed. | Chưa có HA, signature-age alert, EICAR/outage evidence hoặc xác nhận tải database lần đầu trong môi trường đích. |
| Quarantine/CDR | **Not implemented** | File được scan hook rồi ghi thẳng bucket nếu được phép; không có quarantine bucket/state/promotion/CDR. |
| Observability | **Partially implemented** | Actuator health/readiness/Prometheus, request ID, CI Trivy/gitleaks; [CI]. | Chưa có production dashboard, alert rules, SIEM, SLO, tracing và on-call evidence. |
| Backup và restore drill | **External/production dependency** | Có [backup script]/[restore script] local nhưng chưa production-ready; thiếu document DB trong backup, PITR/off-site/version preservation và bằng chứng restore drill. |
| Dashboard khối lượng, SLA/job alerts | **Not implemented** | Không có generation job/SLA model, operations dashboard hoặc alert thất bại theo matter/package. |
| Watermark và QR/mã phát hành | **Not implemented** | Không có rendition/final issuance pipeline. |
| Chứng nhận ISO/attestation | **External/production dependency** | Source và tài liệu không tạo ra chứng nhận. Cần scope, policy, evidence vận hành, risk assessment và đánh giá độc lập. Hiện **không được tuyên bố đạt ISO**. |

## 7. Checklist nghiệm thu từ báo cáo

### 7.1 Chức năng cốt lõi

| Checklist | Trạng thái | Bằng chứng/điều kiện đóng |
|---|---|---|
| Upload DOCX hợp lệ | **Implemented** | `POST /documents/templates` và `/upload-raw`; [template service]. Cần MinIO integration/UAT trên artifact cuối. |
| File không hợp lệ bị từ chối đúng lý do | **Implemented** | Extension/MIME/magic/package/size và GlobalExceptionHandler; [DOCX test]. |
| Placeholder phát hiện chính xác | **Implemented** | `${key}` xuyên run/part; [DOCX engine], [DOCX test]. |
| Không thay nhầm text trùng | **Implemented** | `expectedOccurrences` và reject mapping mơ hồ; [DOCX test]. |
| Tạo thử trước publish | **Partially implemented** | Publish tự trial-render; có `POST /{id}/dry-run`. Chưa có UI/output preview thử. |
| Publish không làm mất thay đổi | **Implemented** | Payload publish thống nhất + revision; [publish test], [editor test]. |
| DOCX sinh ra mở bằng Microsoft Word | **Partially implemented** | Output được docx4j parse lại; chưa có Word/LibreOffice compatibility UAT. |
| Giữ định dạng quan trọng | **Partially implemented** | Thay trên run đầu và test cấu trúc cơ bản; chưa có golden visual corpus ảnh/style/tracked changes. |
| Người không quyền không tải file | **Partially implemented** | Admin/creator/reviewer check, audit access denied và gateway headers; [generated service]. Thiếu controller/security integration test riêng cho download và ABAC matter đầy đủ. |

### 7.2 Phiên bản

| Checklist | Trạng thái | Bằng chứng/điều kiện đóng |
|---|---|---|
| Mỗi sửa nội dung tạo version mới | **Implemented** | [template version], [template service]. |
| Có người sửa và thời gian | **Implemented** | `createdByUserId`, `createdAt`, change reason/effective date. |
| Xem phiên bản cũ | **Implemented** | List/detail/preview version API và UI history. |
| Tài liệu cũ trỏ đúng mẫu cũ | **Implemented** | `templateVersionId`, template SHA/version snapshot tại [generated document]. |
| Khôi phục an toàn | **Implemented** | Restore tạo draft/version mới. Cần thêm integration/concurrency regression test. |

### 7.3 UI/UX

| Checklist | Trạng thái | Bằng chứng/điều kiện đóng |
|---|---|---|
| Lối vào sidebar admin | **Implemented** | [nav config], [document layout]. |
| Active navigation đúng | **Implemented** | `NavLink` trong shared shell/module nav. |
| Search, filter, sort, pagination | **Implemented** | [template list], [generated list], page APIs và [UI tests]. |
| Mobile không tràn/mất hành động | **Partially implemented** | Card/grid, panel tabs và responsive history đã có; cần device/browser E2E. |
| Accessible name/focus/status | **Partially implemented** | Labels, `aria-*`, field error focus và Spinner live status đã bổ sung. CI axe hiện chủ yếu public pages, chưa chứng minh authenticated document flow. |
| Cảnh báo dữ liệu chưa lưu | **Implemented** | [unsaved hook], [unsaved test]. |
| Lỗi cạnh trường | **Implemented** | `aria-invalid`/`aria-describedby`, issue list và focus lỗi đầu tiên tại editor/generate/upload. |

### 7.4 Bảo mật và vận hành

| Checklist | Trạng thái | Bằng chứng/điều kiện đóng |
|---|---|---|
| File được quét trước xử lý | **Partially implemented** | Hook ClamAV chạy trước upload; Compose production bật scanner fail-closed trên mạng private. Cần evidence EICAR/outage/signature freshness trước khi đóng checklist production. |
| Giới hạn giải nén/zip bomb | **Implemented** | Entry/expanded bytes/single-entry/compression ratio limits tại [DOCX engine]. |
| External relationship/embedded object | **Implemented** | Reject external, macro, embedding/ActiveX; [DOCX test]. |
| Không PII trong log | **Partially implemented** | Audit metadata được giới hạn, values/reason được mã hóa; chưa có dynamic log leakage test/SIEM policy. |
| Mã hóa và kiểm soát truy cập | **Implemented** | Document AES-GCM + previous keys; party AES-GCM v2 + dual-read v1/v2; private API download; [encryption test], [party cipher test], [party tests]. Production còn phụ thuộc KMS, re-encryption/retire-key drill. |
| Audit log | **Partially implemented** | Module audit đã có; chưa bất biến/tamper-evident và chưa bao phủ đầy đủ. |
| Job dọn file rác | **Not implemented** | Có compensation tức thời khi save thất bại, nhưng không có scheduled orphan reconciliation/cleanup. |
| Backup và restore đã kiểm thử | **External/production dependency** | Chưa có evidence restore drill; script hiện tại không được tính là control production. |

## 8. External/production dependencies bắt buộc khai báo riêng

| Năng lực | Dependency cần quyết định/triển khai | Evidence cần có |
|---|---|---|
| PDF/A | Renderer được pin version, font pack, PDF/A profile và independent validator. | Golden files, validator report, visual/semantic QA và archival metadata. |
| Ký số/e-sign | CA/provider, certificate lifecycle, HSM/KMS, TSA, identity/consent và pháp lý jurisdiction. | Signature validation, timestamp, revocation/LTV, audit và hợp đồng nhà cung cấp. |
| Email pháp lý | Provider, domain SPF/DKIM/DMARC, recipient verification và retention. | Message/content hash, delivery/bounce/complaint audit, approval và incident path. |
| Antivirus/quarantine | ClamAV/scanner HA, signature updates, quarantine storage, CDR và fail-closed monitoring. | EICAR test cô lập, outage test, scan backlog/signature-age alert và promotion audit. |
| Backup/DR | Off-site immutable storage, KMS escrow, MySQL/Mongo PITR, MinIO version replication và recovery environment. | Restore drill có count/hash/decryption, RPO/RTO thực đo và sign-off. |
| Chứng nhận | Policy, risk/DPIA, đào tạo, control owner, evidence nhiều chu kỳ và auditor độc lập. | Report/certificate đúng scope. Không suy diễn từ code. |

## 9. Next release gates ưu tiên

### Gate R1 — Đóng P0 code và UAT

1. Merge ổn định document/frontend; chạy full CI và lưu artifact/test report.
2. Thêm golden corpus DOCX đã khử định danh: image, bold/italic, table merge, header/footer, hyperlink,
   textbox, tracked change, Unicode; mở bằng Word và LibreOffice.
3. Nối dry-run vào UI, cho tải/xem output thử và bắt buộc xác nhận trước publish theo policy.
4. Bổ sung integration test MinIO/Mongo cho version pin, restore, idempotency race, download deny và
   compensation.
5. Thêm orphan reconciliation có dry-run, checksum, audit và alert.

### Gate R2 — Production security/operations

1. Bật scanner thật theo fail-closed; triển khai quarantine → scan/CDR → promote. Không cho
   `DISABLED`/`UNAVAILABLE_ALLOWED` ở production.
2. Hoàn tất secret manager/KMS, per-service IAM, rotation drill, migration legacy plaintext, CRM
   re-encryption và evidence retire khóa cũ.
3. Dùng migration tool; production `ddl-auto=validate`, image pin digest và rollback evidence.
4. Chạy backup/restore drill MySQL + Mongo `law-app-documents` + MinIO versions; phê duyệt RPO/RTO.
5. Hoàn thiện RBAC/ABAC matter, separation of duties, authenticated a11y/UAT và central audit alerts.

### Gate R3 — Tự động hóa nghiệp vụ

1. Server-side authorized CRM data resolution có source revision/provenance và missing-field workflow.
2. Service package version bất biến và background generation job có idempotency/retry/partial result.
3. Repeated table/party, conditional clause, locale date/money và cross-field business rules.
4. ApprovalTask nhiều cấp pin document version/hash, SLA/delegation/comment và issue/void workflow.

### Gate R4 — Phát hành và records management

1. PDF/A rendition + independent validation.
2. Ký số/e-sign, timestamp và verification evidence.
3. Email/secure portal có recipient authorization, revoke và delivery audit.
4. Retention schedule, legal hold, disposition hai người và WORM/object version policy.
5. Chỉ đánh giá chứng nhận sau khi có đủ policy, evidence vận hành và audit độc lập.

## 10. Quyết định release hiện tại

Code hiện tại có thể được xem là một bước tiến đáng kể từ “mail merge” sang nền tảng quản lý template
và workflow tài liệu nội bộ. Tuy nhiên:

- **chưa đủ điều kiện gọi là tự động hóa trọn bộ dịch vụ pháp lý**;
- **chưa có PDF/A, ký số/e-sign hoặc email phát hành pháp lý**;
- **antivirus/quarantine production và restore drill chưa đạt**;
- **chưa có retention/legal hold enforcement**;
- **không có tuyên bố hoặc chứng nhận ISO**.

Go-live với dữ liệu thật chỉ được quyết định sau khi Gate R1/R2 có evidence và owner ký duyệt.

[template controller]: ../document-service/src/main/java/org/law_app/document/web/DocumentTemplateController.java
[template service]: ../document-service/src/main/java/org/law_app/document/service/DocumentTemplateServiceImpl.java
[template version]: ../document-service/src/main/java/org/law_app/document/domain/DocumentTemplateVersion.java
[version manager]: ../document-service/src/main/java/org/law_app/document/service/DocumentTemplateVersionManager.java
[publish test]: ../document-service/src/test/java/org/law_app/document/service/DocumentTemplatePublishTest.java
[DOCX engine]: ../document-service/src/main/java/org/law_app/document/service/DocxTemplateEngine.java
[DOCX test]: ../document-service/src/test/java/org/law_app/document/service/DocxTemplateEngineTest.java
[value validator]: ../document-service/src/main/java/org/law_app/document/service/DocumentValueValidator.java
[validator test]: ../document-service/src/test/java/org/law_app/document/service/DocumentValueValidatorTest.java
[malware scanner]: ../document-service/src/main/java/org/law_app/document/service/DocumentMalwareScanner.java
[malware test]: ../document-service/src/test/java/org/law_app/document/service/DocumentMalwareScannerTest.java
[generated service]: ../document-service/src/main/java/org/law_app/document/service/GeneratedDocumentServiceImpl.java
[generated document]: ../document-service/src/main/java/org/law_app/document/domain/GeneratedDocument.java
[legal context]: ../document-service/src/main/java/org/law_app/document/domain/LegalDocumentContext.java
[workflow status]: ../document-service/src/main/java/org/law_app/document/domain/DocumentWorkflowStatus.java
[workflow test]: ../document-service/src/test/java/org/law_app/document/service/GeneratedDocumentWorkflowTest.java
[encryption service]: ../document-service/src/main/java/org/law_app/document/service/SensitiveValueEncryptionService.java
[encryption test]: ../document-service/src/test/java/org/law_app/document/service/SensitiveValueEncryptionServiceTest.java
[audit service]: ../document-service/src/main/java/org/law_app/document/service/DocumentAuditService.java
[party controller]: ../crm-service/src/main/java/org/law_app/crm/web/MatterPartyController.java
[party cipher]: ../crm-service/src/main/java/org/law_app/crm/service/PartyPiiCipher.java
[party cipher test]: ../crm-service/src/test/java/org/law_app/crm/service/PartyPiiCipherTest.java
[party tests]: ../crm-service/src/test/java/org/law_app/crm/service/MatterPartyServiceTest.java
[outbox dispatcher]: ../backend/src/main/java/org/law_app/backend/event/OutboxDispatcher.java
[case listener]: ../crm-service/src/main/java/org/law_app/crm/event/CaseEventListener.java
[case event tests]: ../crm-service/src/test/java/org/law_app/crm/event/CaseEventListenerTest.java
[gateway filter]: ../gateway/src/main/java/org/law_app/gateway/DocumentResponseSecurityFilter.java
[gateway test]: ../gateway/src/test/java/org/law_app/gateway/DocumentResponseSecurityFilterTest.java
[field editor]: ../frontend/src/page/documents/TemplateFieldEditor.tsx
[editor test]: ../frontend/src/page/documents/__tests__/TemplateFieldEditor.test.tsx
[template list]: ../frontend/src/page/documents/TemplateList.tsx
[generated list]: ../frontend/src/page/documents/GeneratedDocumentList.tsx
[generate page]: ../frontend/src/page/documents/GenerateDocument.tsx
[document layout]: ../frontend/src/page/documents/DocumentLayout.tsx
[nav config]: ../frontend/src/page/admin/home/navConfig.ts
[UI tests]: ../frontend/src/page/documents/__tests__/documentUi.test.ts
[unsaved hook]: ../frontend/src/page/documents/useUnsavedChangesWarning.ts
[unsaved test]: ../frontend/src/page/documents/__tests__/useUnsavedChangesWarning.test.tsx
[CI]: ../.github/workflows/ci.yml
[backup script]: ../scripts/backup.sh
[restore script]: ../scripts/restore.sh

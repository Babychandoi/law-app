# Kiến trúc quản lý và tự động hóa tài liệu pháp lý

## 1. Mục tiêu

Module tài liệu là bounded context **Legal Automation & Records**, không còn được xem như một màn
hình mail-merge. Hệ thống phải:

- lấy dữ liệu có nguồn gốc rõ ràng từ matter/CRM;
- phát hiện dữ liệu còn thiếu thay vì tự suy diễn dữ liệu pháp lý;
- khóa chính xác phiên bản mẫu và dữ liệu đầu vào dùng để sinh tài liệu;
- tạo một hoặc một bộ tài liệu theo job có idempotency;
- duyệt trên đúng phiên bản và SHA-256 đã xem;
- giữ audit, retention và legal hold;
- không công khai object storage hoặc dữ liệu nhạy cảm.

Thiết kế giữ tương thích các endpoint `/documents/**` hiện có. API workflow mới được phát triển dưới
`/documents/v2/**`; migration không đổi ID case:

```text
CustomerService.id == CrmCase.id == matterId
```

## 2. Context map

```text
backend
  Public intake + service catalog
        │ transactional outbox
        ▼
crm-service
  Matter + Party + Assignment + Care
        │ versioned event / authorized context API
        ▼
document-service
  Template/Package → Data resolution → Generation job
                              │
                              ▼
  Legal document/version → Review/Approval → Final/Issue
                              │
                              ▼
  Audit → Retention → Legal hold → Controlled disposition
```

| Dữ liệu | Nguồn sự thật |
|---|---|
| Tiếp nhận công khai, catalog dịch vụ | `backend` |
| Matter, party, assignment, trạng thái nghiệp vụ | `crm-service` |
| Mẫu, phiên bản mẫu, package, rule | `document-service` |
| Input snapshot, tài liệu, phiên bản, approval | `document-service` |
| Binary và rendition | MinIO/S3 private, truy cập qua service |

`document-service` không được sửa dữ liệu khách hàng trong CRM. Nó lưu reference, source revision và
snapshot bất biến tại thời điểm sinh.

## 3. Bất biến nghiệp vụ

1. Published template version là bất biến; sửa mẫu luôn tạo draft/version khác.
2. Một generated document phải trỏ `templateVersionId`, hash mẫu và input snapshot cụ thể.
3. Cùng idempotency key + cùng request trả cùng kết quả; cùng key + request khác trả `409`.
4. Approval gắn với `documentVersionId` và SHA-256; version mới làm approval cũ hết hiệu lực.
5. Người tạo không tự duyệt nếu workflow yêu cầu separation of duties.
6. Không có API hard-delete thông thường đối với legal record.
7. Legal hold luôn thắng retention/disposition.
8. Download, publish, generation, workflow transition, denied access và disposition đều có audit.
9. Không lưu plaintext PII trong log, event broker hoặc metadata không cần thiết.
10. Event delivery là at-least-once; consumer phải có inbox idempotent và xử lý event cũ.

## 4. Mô hình miền

### 4.1 Template

- `DocumentTemplate`: logical identity, metadata, working draft, active/latest version và revision.
- `DocumentTemplateVersion`: file/schema/rule/hash/engine version bất biến, effective dates, publisher.
- `TemplateField`: path, label, typed validation, classification, source binding và display metadata.

Vòng đời:

```text
WORKING_DRAFT → VALIDATED → PUBLISHED → SUPERSEDED | RETIRED
```

Restore version cũ tạo draft mới; không mở khóa version đã publish.

### 4.2 Matter và party

- `Matter`: dùng `CrmCase.id`, có service, owner/team, jurisdiction, classification và revision.
- `Party`: `CLIENT`, `APPLICANT`, `OWNER`, `AUTHOR`, `REPRESENTATIVE`, `COUNTERPARTY`.
- Party có thể là `PERSON` hoặc `ORGANIZATION`.
- Payload PII được mã hóa AES-256-GCM; record chỉ lưu ciphertext, key ID và metadata không nhạy cảm.

### 4.3 Service package

- `ServicePackage`: logical identity gắn stable `serviceId/serviceCode`.
- `ServicePackageVersion`: danh sách `templateVersionId` đã pin, thứ tự, điều kiện, input schema và
  workflow policy bất biến.

### 4.4 Generation

- `GenerationJob`: request fingerprint, idempotency key, matter/package refs, trạng thái, attempt,
  missing fields, sanitized error và result IDs.
- `InputSnapshot`: normalized values, provenance/source revision, schema version và SHA-256; values
  được mã hóa.
- `FileAsset`: bucket/key không chứa PII, MIME, byte size, hash, scan state và encryption key ref.

Vòng đời:

```text
QUEUED → RESOLVING_DATA → AWAITING_INPUT → RENDERING → VALIDATING
       → COMPLETED | PARTIAL_FAILED | FAILED | CANCELLED
```

### 4.5 Legal document và records

- `LegalDocument`: matter, loại tài liệu, current version, workflow status, classification.
- `DocumentVersion`: asset/rendition bất biến, exact template version, input snapshot và hashes.
- `ApprovalTask`: exact version/hash, stage, assignee, due date và immutable decision.
- `RetentionSchedule/Assignment`: record class, jurisdiction, trigger và due date.
- `LegalHold`: scope/reason/issuer/release metadata.
- `DispositionCase`: two-person approval, execution evidence và non-PII tombstone.

Workflow:

```text
DRAFT → IN_REVIEW → CHANGES_REQUESTED → DRAFT
                  → APPROVED → FINAL → ISSUED
                                      └→ VOID
```

## 5. API

### 5.1 Compatibility API

Các endpoint cũ tiếp tục hoạt động:

- `POST /documents/templates/upload-raw`
- `PUT /documents/templates/{id}/mappings`
- `PUT /documents/templates/{id}/fields`
- `PUT /documents/templates/{id}/publish`
- `POST /documents/templates/{id}/generate`
- `GET /documents/generated`
- `GET /documents/generated/{id}/download`

Hành vi nội bộ phải an toàn hơn:

- mapping tạo object draft mới, không overwrite;
- publish có body tùy chọn để save + publish nguyên tử;
- publish tạo immutable version;
- generation pin active version;
- endpoint list cũ giữ array, endpoint page mới trả metadata.

### 5.2 V2 resource API

Template:

```text
GET  /documents/v2/templates
POST /documents/v2/templates
PATCH /documents/v2/templates/{id}/draft
PUT  /documents/v2/templates/{id}/draft-file
POST /documents/v2/templates/{id}/draft:validate
POST /documents/v2/templates/{id}/draft:publish
GET  /documents/v2/templates/{id}/versions
POST /documents/v2/templates/{id}/versions/{versionId}:restore
```

Package và data resolution:

```text
GET|POST /documents/v2/service-packages
POST     /documents/v2/service-packages/{id}/draft:validate
POST     /documents/v2/service-packages/{id}/draft:publish
GET      /documents/v2/matters/{matterId}
GET      /documents/v2/matters/{matterId}/documents
POST     /documents/v2/data-resolutions
```

Generation:

```text
POST /documents/v2/generation-jobs
GET  /documents/v2/generation-jobs/{id}
POST /documents/v2/generation-jobs/{id}:provide-input
POST /documents/v2/generation-jobs/{id}:retry
POST /documents/v2/generation-jobs/{id}:cancel
```

Workflow và records:

```text
GET  /documents/v2/legal-documents/{id}
GET  /documents/v2/legal-documents/{id}/versions
POST /documents/v2/legal-documents/{id}:submit-review
POST /documents/v2/approval-tasks/{id}:approve
POST /documents/v2/approval-tasks/{id}:request-changes
POST /documents/v2/legal-documents/{id}:finalize
POST /documents/v2/legal-documents/{id}:issue
POST /documents/v2/legal-documents/{id}:void
POST /documents/v2/legal-holds
POST /documents/v2/legal-holds/{id}:release
POST /documents/v2/disposition-cases/{id}:approve
POST /documents/v2/disposition-cases/{id}:execute
```

V2 dùng `ETag/If-Match` cho optimistic concurrency, `Idempotency-Key` cho command có retry và
`application/problem+json` cho lỗi theo RFC 9457.

## 6. Authorization

Role đích:

- `SYSTEM_ADMIN`
- `LEGAL_ADMIN`
- `TEMPLATE_AUTHOR`
- `TEMPLATE_PUBLISHER`
- `MATTER_OWNER`
- `MATTER_CONTRIBUTOR`
- `REVIEWER`
- `APPROVER`
- `RECORDS_MANAGER`
- `AUDITOR`

Trong migration, legacy `ADMIN` nhận quyền legal-admin trên API v1; `USER` chỉ thao tác matter được
giao và tài liệu của mình. Mọi quyết định đọc/ghi còn xét:

- organization;
- matter assignment/team;
- classification/clearance;
- ethical wall;
- resource state;
- explicit ACL;
- legal hold và purpose of use.

Đích production là OIDC/JWKS chữ ký bất đối xứng và service identity riêng; không chia sẻ khóa HMAC
có khả năng phát token giữa các service.

## 7. Event reliability

Business transaction ghi event vào MySQL outbox. Dispatcher gửi RabbitMQ với publisher confirm và
retry. CRM lưu event ID vào inbox cùng transaction apply projection.

Event envelope tối thiểu:

```json
{
  "eventId": "uuid",
  "schemaVersion": 1,
  "occurredAt": "2026-07-29T08:00:00Z",
  "correlationId": "request-id",
  "aggregateType": "CASE",
  "aggregateId": "case-uuid",
  "data": {
    "serviceId": "service-uuid"
  }
}
```

Không đưa PII đầy đủ lên broker khi consumer có thể resolve bằng authorized reference API.

## 8. File security

Pipeline bắt buộc:

```text
upload → quarantine → ZIP/MIME validation → reject external/OLE/macro
       → antivirus/CDR → compile/test → private immutable bucket
```

- Không tin extension hoặc client Content-Type.
- Giới hạn entry count, expanded bytes và compression ratio.
- Object key không chứa tên khách hàng.
- SHA-256 cho mọi asset.
- MinIO/S3 không public; chỉ public bucket ảnh và attachment cần thiết qua path allowlist.
- Mỗi service dùng IAM policy riêng; root credential chỉ tồn tại trong bootstrap.
- Dữ liệu form/snapshot được mã hóa application-layer; production nên dùng KMS/envelope encryption.
- Download đi qua API có authorization, no-store headers và audit.

## 9. Retention

Không hard-code một thời hạn cho mọi tài liệu. Schedule cấu hình theo record class, jurisdiction,
dịch vụ, trigger, thời lượng ISO-8601, policy owner và effective dates.

Disposition chỉ chạy khi:

1. đến hạn;
2. không có legal hold;
3. đủ hai người duyệt độc lập;
4. xóa object versions/derived indexes đúng policy;
5. giữ tombstone không PII cùng checksum và audit evidence.

## 10. Baseline chuẩn

- [ISO 15489-1:2016](https://www.iso.org/standard/62542.html): records management.
- [ISO 16175-1:2020](https://www.iso.org/standard/74294.html): functional requirements for digital
  records systems.
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
- [NIST SP 800-218 SSDF](https://csrc.nist.gov/pubs/sp/800/218/final).
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), mục tiêu AA.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html): conditional request/ETag.
- [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html): Problem Details.

Tuân chuẩn không thể được tuyên bố chỉ từ source code. Chứng nhận còn cần policy, risk assessment,
phân công trách nhiệm, đào tạo, evidence vận hành, restore/DR test và đánh giá độc lập.

# Runbook vận hành production — Nền tảng quản lý và tự động hóa pháp lý

## 1. Mục đích và phạm vi

Tài liệu này là baseline vận hành production cho các thành phần `backend`, `crm-service`,
`document-service`, `gateway`, frontend, MySQL, MongoDB, Redis, RabbitMQ và MinIO/S3. Mô hình miền
và các bất biến nghiệp vụ nằm tại
[LEGAL-AUTOMATION-ARCHITECTURE.md](./LEGAL-AUTOMATION-ARCHITECTURE.md).

Runbook áp dụng cho:

- quản lý môi trường, secret và khóa mã hóa;
- phân quyền vận hành theo nguyên tắc đặc quyền tối thiểu;
- triển khai, migration, rollback và kiểm tra sau triển khai;
- backup, khôi phục, DR, retention và legal hold;
- audit, log, cảnh báo, outbox và DLQ;
- xử lý sự cố, rò rỉ dữ liệu và file độc hại;
- thu thập bằng chứng phục vụ kiểm toán.

Không dùng tài liệu này như tư vấn pháp lý cho một khu vực tài phán cụ thể. Thời hạn lưu trữ,
nghĩa vụ thông báo vi phạm, nơi lưu dữ liệu và quyền của chủ thể dữ liệu phải được Legal/DPO phê
duyệt theo luật, hợp đồng và loại hồ sơ thực tế.

## 2. Quy ước trạng thái

| Nhãn | Ý nghĩa |
|---|---|
| **Hiện có** | Có thể đối chiếu trong source/config của repository tại thời điểm viết tài liệu. |
| **Giới hạn hiện tại** | Đã có một phần nhưng chưa đủ làm control production hoàn chỉnh. |
| **Bắt buộc trước production** | Control phải được triển khai, kiểm thử và có owner phê duyệt trước khi nhận dữ liệu thật. |
| **Cần phê duyệt** | Quyết định nghiệp vụ/rủi ro; đội kỹ thuật không được tự đặt thay tổ chức. |

### 2.1 Baseline đã có và khoảng trống

| Khu vực | Trạng thái hiện tại | Việc còn phải hoàn tất |
|---|---|---|
| Mã hóa PII bên liên quan | **Hiện có:** AES-256-GCM, nonce ngẫu nhiên, AAD gắn `caseId` và `partyId`; envelope v2 có `keyId`, key ring bounded, đọc được v1/v2 và endpoint fail closed khi cấu hình khóa sai. | **Giới hạn:** chưa có tác vụ re-encrypt/inventory để retire khóa cũ có kiểm soát. |
| Mã hóa input sinh tài liệu | **Hiện có:** AES-256-GCM, AAD gắn document/template version, có `keyId` và danh sách khóa cũ chỉ để giải mã. | **Giới hạn:** chưa có re-encrypt nền; dữ liệu legacy có thể vẫn dùng trường plaintext tương thích ngược. |
| MinIO | **Hiện có:** bucket tài liệu/CV private, credential theo service và policy theo bucket; console/S3 private không được route công khai. | **Giới hạn:** root credential còn là fallback, `.env` dùng chung, policy hiện cho phép `DeleteObject`, topology một node/volume, chưa có object lock/replication được chứng minh. |
| Tích hợp case → CRM | **Hiện có:** transactional outbox, publisher confirm, retry; consumer inbox idempotent và DLQ. | **Giới hạn:** chưa có công cụ/operator workflow replay DLQ và reconciliation hoàn chỉnh. |
| Audit | **Hiện có:** audit backend; audit append-only theo API cho party; audit template/generated document và download/workflow. | **Giới hạn:** chưa có kho log tập trung bất biến, hash chain/WORM, SIEM và cảnh báo đầy đủ; DB admin vẫn có thể sửa dữ liệu audit. |
| Upload DOCX | **Hiện có:** giới hạn kích thước/ZIP, chặn path traversal, macro, OLE/ActiveX, external relationship và zip bomb; ClamAV INSTREAM fail-closed trên mạng private, Compose dùng image `clamav/clamav:1.5.2_base` và volume signature. | **Bắt buộc:** xác minh signature update/EICAR/outage ở môi trường đích, quarantine/CDR, scan state/promotion và quy trình xử lý malware. |
| Retention/legal hold | Thiết kế miền đã xác định nguyên tắc “legal hold thắng disposition”. | **Bắt buộc:** schedule, assignment, enforcement, approval hai người và disposition evidence chưa được triển khai đầy đủ. |
| Backup/DR | Có `scripts/backup.sh` và `scripts/restore.sh` làm baseline local. | **Bắt buộc:** pipeline backup production mã hóa, off-site, bất biến, PITR, bảo toàn object version và restore drill chưa có bằng chứng. |
| IAM người dùng | **Hiện có:** legacy `ADMIN`/`USER`, kiểm tra admin/người được giao matter và owner/reviewer ở một số luồng. | **Bắt buộc:** role legal chuyên biệt, ABAC/ethical wall, MFA/JIT admin và separation of duties chưa đầy đủ. |
| Schema migration | JPA hiện được điều khiển bằng `ddl-auto`; cấu hình mẫu còn có `create-drop`/`update`. | **Bắt buộc:** Flyway/Liquibase hoặc công cụ migration tương đương, production dùng `validate`; tuyệt đối không dùng `create`, `create-drop` hoặc tự đổi schema bằng Hibernate. |
| HA/DR | Docker Compose hiện là một failure domain. | **Bắt buộc:** replica/multi-AZ hoặc dịch vụ managed, site DR độc lập và diễn tập failover. |

## 3. Trách nhiệm và quyền phê duyệt

Mỗi môi trường production phải có danh sách người trực và người thay thế, không chỉ tên đội.

| Vai trò vận hành | Trách nhiệm | Không được tự làm |
|---|---|---|
| Business Owner | Phê duyệt mức dịch vụ, RPO/RTO và thời gian gián đoạn. | Không tự phê duyệt ngoại lệ bảo mật. |
| Legal/DPO | Phê duyệt retention, legal hold, khu vực dữ liệu, thông báo vi phạm. | Không trực tiếp sửa DB/object. |
| Records Manager | Sở hữu record class, hold, disposition và bằng chứng tiêu hủy. | Không vừa yêu cầu vừa tự duyệt disposition. |
| Security/Incident Commander | Điều phối sự cố, containment, bằng chứng và quyết định security. | Không xóa dấu vết hoặc thu hồi khóa cũ trước khi bảo toàn khả năng khôi phục. |
| SRE/Platform | Deploy, backup, restore, monitoring, DR và hạ tầng. | Không đọc nội dung hồ sơ nếu không có ticket, purpose và quyền tạm thời. |
| DBA/Storage Operator | PITR, snapshot, kiểm tra toàn vẹn và capacity. | Không cấp quyền ứng dụng bằng root/admin. |
| Release Manager | Điều phối change, migration, go/no-go và rollback. | Không tự phê duyệt release do chính mình tạo nếu chính sách yêu cầu bốn mắt. |
| Auditor | Đọc evidence và audit trail. | Không sửa, xóa hoặc vận hành nghiệp vụ. |

Mọi thao tác khẩn cấp bằng break-glass phải có MFA, thời hạn tự hết, lý do/ticket, ghi session nếu pháp
luật cho phép, và review sau sự cố. Tài khoản break-glass không dùng cho công việc hằng ngày.

## 4. Mô hình môi trường và secret

### 4.1 Tách môi trường

| Môi trường | Dữ liệu | Yêu cầu |
|---|---|---|
| Local/dev | Dữ liệu giả lập. | Không có secret hoặc bản sao dữ liệu production. Có thể reset. |
| Test/CI | Fixture tự sinh, không PII. | Secret ngắn hạn, quyền tối thiểu, hủy sau job; artifact và log không chứa secret. |
| Staging | Dữ liệu synthetic hoặc đã khử định danh được DPO chấp thuận. | Account/network/database/bucket/key riêng; cấu hình tương đương production nhưng không dùng chung identity. |
| Production | Dữ liệu thật. | Account/project riêng, private network, egress allowlist, access JIT, backup/DR độc lập. |

Không clone database production sang staging bằng cách “ẩn vài cột”. Nếu cần dữ liệu để điều tra lỗi,
phải có quy trình trích xuất tối thiểu, tokenization/ẩn danh không đảo ngược, phê duyệt DPO và nhật ký
truy cập.

Mỗi môi trường phải tách riêng:

- DNS, cluster/host, network và firewall;
- MySQL schema/user; Mongo database/user; RabbitMQ vhost/user; Redis ACL;
- MinIO bucket, service identity và root/admin identity;
- khóa mã hóa CRM/document, JWT/OIDC client, Cloudflare tunnel, TLS key;
- email/API AI và mọi credential nhà cung cấp.

### 4.2 Quản lý secret

**Bắt buộc trước production:**

1. Lưu secret trong secret manager/KMS/HSM được tổ chức phê duyệt; không lưu trong Git, image, ticket,
   wiki, shell history hoặc file backup không mã hóa.
2. Cấp secret trực tiếp cho đúng workload qua secret mount/identity; không dùng một `.env` chung cho
   mọi container.
3. Tách quyền “đọc secret”, “đổi secret” và “quản trị secret store”. Bật MFA, audit và cảnh báo cho
   mọi lần đọc secret nhạy cảm.
4. Gán owner, purpose, environment, ngày tạo, phiên bản và ngày review cho từng secret. Không ghi
   giá trị secret vào inventory.
5. Dùng nguồn ngẫu nhiên mật mã. Khóa AES phải là đúng 32 byte rồi Base64; không dùng password,
   JWT key hoặc MinIO secret làm khóa dữ liệu.
6. Có escrow/recovery cho khóa giải mã, tách khỏi backup dữ liệu. Mất cả khóa hiện hành và khóa lịch
   sử đồng nghĩa backup ciphertext không thể khôi phục.
7. Xoay ngay khi nghi ngờ lộ, nhân sự đặc quyền rời tổ chức, hoặc policy yêu cầu. Chu kỳ định kỳ phải
   do Security phê duyệt theo rủi ro, không mặc định một con số cho mọi secret.

Inventory tối thiểu gồm:

- `DOCUMENT_DATA_ENCRYPTION_KEY`, `DOCUMENT_DATA_ENCRYPTION_KEY_ID` và
  `DOCUMENT_DATA_ENCRYPTION_PREVIOUS_KEYS`;
- `CRM_DATA_ENCRYPTION_KEY`, `CRM_DATA_ENCRYPTION_KEY_ID` và
  `CRM_DATA_ENCRYPTION_PREVIOUS_KEYS`;
- MinIO root và `MINIO_BACKEND_*`, `MINIO_CHAT_*`, `MINIO_DOCUMENT_*`;
- MySQL root/app/backup; Mongo root và user riêng từng database;
- RabbitMQ publisher/consumer; Redis ACL; JWT/OIDC; tunnel/TLS; email và AI provider.

### 4.3 Giới hạn credential hiện tại

- Docker Compose dùng `env_file: .env` ở nhiều service nên process có thể nhận secret ngoài phạm vi
  cần thiết. Production phải chuyển sang secret riêng từng service.
- Mongo URI hiện dùng root credential; RabbitMQ dùng credential dùng chung; Redis Compose chưa bật
  authentication/ACL. Production phải dùng identity riêng, TLS/mTLS hoặc private network policy, và
  quyền theo database/vhost/key-prefix.
- Các service hiện xác minh JWT bằng HMAC dùng chung. Đích production là OIDC/JWKS bất đối xứng:
  service chỉ có public verification key, không có khả năng tự phát token.
- Giá trị mặc định trong `.env.example` chỉ phục vụ local; không được copy sang production.
- `BOOTSTRAP_ADMIN_*` chỉ dùng một lần, sau đó phải xóa khỏi secret injection và xác minh không còn
  trong environment/container inspect.

## 5. RBAC, ABAC và đặc quyền tối thiểu

### 5.1 Mô hình đích

Ánh xạ role đích:

- `SYSTEM_ADMIN`: hạ tầng/identity, không mặc nhiên được đọc hồ sơ.
- `LEGAL_ADMIN`: cấu hình legal workflow, không quản trị hạ tầng.
- `TEMPLATE_AUTHOR`: soạn draft nhưng không publish.
- `TEMPLATE_PUBLISHER`: validate/publish; không tự duyệt nội dung do mình tạo nếu policy yêu cầu.
- `MATTER_OWNER` và `MATTER_CONTRIBUTOR`: chỉ matter được giao.
- `REVIEWER` và `APPROVER`: chỉ task được giao; approval gắn đúng version/hash.
- `RECORDS_MANAGER`: retention, legal hold và disposition.
- `AUDITOR`: read-only audit/evidence.

Mọi quyết định còn phải xét organization, assignment/team, classification/clearance, ethical wall,
purpose of use, resource state và explicit ACL. Role không thay thế các kiểm tra này.

### 5.2 Trạng thái chuyển tiếp hiện tại

Legacy mới có `ADMIN`/`USER`; party cho phép admin hoặc người đang được giao case, và tài liệu có
kiểm tra owner/reviewer ở một số thao tác. Đây chưa phải separation of duties hoàn chỉnh. Trong giai
đoạn chuyển tiếp:

- giới hạn số `ADMIN`, bắt buộc MFA/JIT và review hằng quý;
- không để một người vừa author, publish, approve và disposition cùng một hồ sơ;
- dùng ticket + duyệt hai người cho publish template, export hàng loạt, legal hold release và xóa;
- thu hồi quyền ngay khi offboarding hoặc đổi nhiệm vụ;
- định kỳ kiểm tra matter không còn assignee, user bất hoạt vẫn còn assignment, và ACL vượt scope.

### 5.3 Service account và MinIO

**Hiện có:** policy MinIO tách backend, chat và document theo bucket.

**Bắt buộc trước production:**

- root MinIO chỉ dùng bootstrap/admin qua kênh riêng; không inject vào workload;
- backup account là read/list/version riêng, không phải root;
- app không có quyền sửa IAM hoặc bucket policy;
- bỏ `DeleteObject` khỏi identity thao tác thường ngày đối với legal records; chỉ disposition worker
  có quyền xóa có điều kiện, sau legal-hold check và approval;
- policy thay đổi phải qua code review, diff evidence và canary kiểm tra cả allow lẫn deny;
- MinIO console và S3 admin API không Internet-routable.

## 6. Mã hóa và xoay khóa

### 6.1 Nguyên tắc chung

- Backup khóa và backup dữ liệu nằm ở hai security domain khác nhau nhưng cùng có quy trình DR.
- Không đổi khóa đồng thời với migration lớn hoặc đổi storage nếu không có kế hoạch cô lập lỗi.
- Trước rotation: inventory bản ghi theo `keyId`/envelope version (v1 cần migration scan), backup đã
  kiểm chứng, test giải mã canary, kế hoạch rollback và người phê duyệt.
- Sau rotation: kiểm tra ghi mới, đọc lịch sử, số lỗi integrity/decryption, audit, metrics và bản ghi
  vẫn tham chiếu khóa cũ.
- Không xóa/revoke khóa cũ khi còn dữ liệu, backup hoặc legal hold cần nó.
- AAD gắn ID bất biến; không được đổi `caseId`, `partyId`, `documentId` hoặc `templateVersionId` khi
  copy dữ liệu nếu không có migration mã hóa được thiết kế riêng.

### 6.2 Xoay khóa document

**Hiện có:** document-service ghi ciphertext AES-256-GCM kèm `keyId`; khóa cũ có thể khai báo dưới
dạng `keyId:base64` trong `DOCUMENT_DATA_ENCRYPTION_PREVIOUS_KEYS`.

Quy trình planned rotation:

1. Tạo khóa 32-byte mới trong KMS/secret manager và một `keyId` duy nhất, không tái sử dụng ID.
2. Giữ khóa hiện hành trong `PREVIOUS_KEYS`; đặt khóa mới làm
   `DOCUMENT_DATA_ENCRYPTION_KEY`/`DOCUMENT_DATA_ENCRYPTION_KEY_ID`.
3. Deploy canary document-service. Health probe là chưa đủ vì service có thể khởi động khi khóa sai;
   phải sinh một tài liệu synthetic và đọc một tài liệu test dùng khóa cũ.
4. Rollout, theo dõi `503` cấu hình khóa, lỗi integrity/giải mã, generation và download.
5. Chạy re-encrypt job idempotent để chuyển bản ghi cũ sang khóa mới, đối chiếu count/hash và audit.
6. Chỉ gỡ khóa cũ sau khi inventory primary, replica, backup còn hiệu lực và legal hold xác nhận không
   còn phụ thuộc; cần duyệt Security + Records Manager.

**Giới hạn hiện tại:** chưa có re-encrypt job; `PREVIOUS_KEYS` chỉ cung cấp khả năng đọc. Vì vậy phải
giữ khóa cũ cho đến khi có tooling và evidence migration. Đồng thời phải inventory và chuyển đổi các
bản ghi legacy còn plaintext trước khi coi application-layer encryption là bao phủ đầy đủ.

### 6.3 Xoay khóa CRM party

**Hiện có:** CRM ghi envelope v2 AES-256-GCM chứa `keyId` không bí mật. Khóa ghi chính được cấu hình
bằng `CRM_DATA_ENCRYPTION_KEY`/`CRM_DATA_ENCRYPTION_KEY_ID`; khóa cũ để giải mã nằm trong
`CRM_DATA_ENCRYPTION_PREVIOUS_KEYS` dưới dạng `keyId:base64`. Reader hỗ trợ cả v2 theo `keyId` và
legacy v1 không có key ID bằng cách thử key ring có giới hạn. Key ring sai định dạng, trùng ID, quá
giới hạn hoặc khóa không đủ 32 byte làm endpoint party fail closed.

Quy trình rotation:

1. Tạo khóa 32-byte và `keyId` mới trong KMS/secret manager; không tái sử dụng ID.
2. Trước khi đổi primary, đưa primary hiện hành vào `CRM_DATA_ENCRYPTION_PREVIOUS_KEYS`; giữ mọi khóa
   vẫn còn ciphertext/backup phụ thuộc.
3. Đặt khóa/ID mới làm primary và deploy canary. Xác minh ghi mới tạo envelope v2 mang ID mới, đồng
   thời đọc được canary v2 dùng khóa cũ và một record legacy v1.
4. Rollout và theo dõi `503`, integrity/decryption error, audit read và latency. Legacy v1 có thể phải
   thử nhiều khóa, nên key ring phải nhỏ và có monitoring.
5. Chạy re-encrypt theo batch idempotent, có checkpoint, count, integrity check và audit; v1 phải
   được chuyển sang v2 để có inventory theo key ID đáng tin cậy.
6. Đối chiếu primary/replica/backup/legal hold. Chỉ gỡ khóa cũ khi không còn dữ liệu cần nó và có
   approval của Security + Records Manager.

**Giới hạn hiện tại:** dual-read/single-write-new-key đã có nhưng chưa có re-encrypt job và evidence
retire-key production. Vì vậy rotation cho phép đổi khóa ghi mà không gây outage, nhưng không cho
phép xóa khóa cũ ngay.

Nếu khóa bị lộ: kích hoạt incident, chặn truy cập party không thiết yếu, giữ khóa cũ chỉ trong vùng
migration cô lập, re-encrypt khẩn cấp sang khóa mới, kiểm chứng rồi mới thu hồi. Không ghi plaintext
vào file trung gian hoặc log.

### 6.4 Xoay credential MinIO

1. Tạo identity/credential mới với cùng policy tối thiểu; không đổi root.
2. Inject credential mới vào đúng một service, rolling restart và kiểm tra read/write đúng bucket,
   đồng thời kiểm tra deny ở bucket ngoài scope.
3. Rollout hết replica, theo dõi lỗi S3 và audit.
4. Disable credential cũ trước; sau khoảng quan sát đã phê duyệt mới xóa.
5. Ghi evidence gồm policy hash, service, thời gian, người phê duyệt và kết quả canary; không ghi
   secret.

Root credential, replication credential và backup credential phải xoay bằng change riêng. Không dùng
một credential cho cả ba mục đích.

## 7. Triển khai, migration và rollback

### 7.1 Cổng go/no-go

Release chỉ được lên production khi có:

- change/ticket, owner, phạm vi, commit SHA và image digest bất biến;
- CI xanh: Java tests, frontend lint/format/build/tests/a11y, secret scan và vulnerability scan;
- SBOM, kết quả scan image/dependency và xử lý ngoại lệ có thời hạn;
- compatibility matrix giữa producer/consumer event và phiên bản API;
- migration reviewed, ước lượng lock/dung lượng/thời gian, dry-run trên bản restore gần production;
- backup ID, checksum và restore evidence còn hiệu lực;
- rollout/canary, rollback/roll-forward và tiêu chí dừng;
- xác nhận key/secret đúng version nhưng không đưa giá trị vào ticket;
- on-call, dashboard và alert đã sẵn sàng.

Không deploy image bằng mutable tag như `latest`. Compose hiện còn image mutable và build tại host;
production phải pull artifact đã build một lần, ký/xác minh và pin bằng digest.

### 7.2 Migration database

**Bắt buộc trước production:** đưa schema MySQL và Mongo index/data migration vào version control bằng
Flyway/Liquibase hoặc công cụ tương đương. Production đặt Hibernate `ddl-auto=validate`.
`create-drop`, `create` và `update` không phải chiến lược migration production.

Dùng expand–migrate–contract:

1. **Expand:** thêm cột/collection/index tương thích ngược; không rename/drop ngay.
2. Deploy code có thể đọc cả schema cũ và mới, ghi theo chiến lược đã duyệt.
3. **Migrate:** backfill theo batch idempotent, checkpoint được, giới hạn tải; log chỉ ID/count.
4. Đối chiếu count, constraint, hash/invariant và error sample.
5. Chuyển read path sang schema mới.
6. **Contract:** drop dữ liệu/schema cũ ở release sau, sau thời gian rollback và legal/retention
   approval.

Migration không đảo ngược thì ưu tiên roll-forward. Không restore toàn production chỉ để rollback một
release ứng dụng nếu có thể sửa tiến.

### 7.3 Thứ tự rollout khuyến nghị

1. Network/IAM/secret và migration additive.
2. Consumer CRM có khả năng hiểu event cũ và mới.
3. Document-service và backend producer.
4. Gateway, sau đó frontend.
5. Backfill/reconciliation sau khi dịch vụ ổn định.
6. Contract migration ở release riêng.

Trong rollout phải duy trì ít nhất một đường đọc/ghi tương thích; không publish event schema mới trước
consumer tương thích.

### 7.4 Rollback

Kích hoạt rollback/roll-forward khi có một trong các điều kiện đã phê duyệt: lỗi auth/authorization,
decryption/integrity, tăng error rate, outbox/DLQ tích tụ, mất audit, sai dữ liệu/hồ sơ hoặc malware
pipeline fail open.

Quy trình:

1. dừng rollout, giữ bằng chứng và thời điểm bắt đầu;
2. nếu có nguy cơ sai dữ liệu, chuyển read-only hoặc tạm dừng command thay vì tắt toàn bộ;
3. rollback image về digest trước nếu schema còn tương thích;
4. nếu schema không tương thích, dùng roll-forward migration đã chuẩn bị;
5. không xóa outbox/DLQ/audit để “làm sạch” dashboard;
6. kiểm tra lại toàn bộ checklist sau deploy và mở incident nếu có tác động dữ liệu.

## 8. Backup production

### 8.1 Chính sách chung

Áp dụng nguyên tắc 3-2-1-1-0:

- ít nhất 3 bản dữ liệu;
- trên ít nhất 2 loại/failure domain;
- 1 bản off-site;
- 1 bản immutable/offline, account tách khỏi production;
- 0 lỗi chưa xử lý sau kiểm tra checksum và restore drill.

Mọi backup phải:

- mã hóa khi truyền và khi lưu, quản lý key tách biệt;
- có manifest: environment, timestamp UTC, checkpoint/binlog/oplog, DB/bucket, object count, byte
  count, checksum, tool/image version và status;
- có retention theo policy, legal hold và quyền xóa hai người;
- không dùng application/root credential; backup identity chỉ có quyền cần thiết;
- cảnh báo khi thất bại, quá tuổi so với RPO, dung lượng bất thường hoặc checksum sai;
- được sao sang failure domain/account khác; volume snapshot trên cùng host không phải DR.

Để giữ nhất quán giữa DB và object storage, cần checkpoint phối hợp hoặc cửa sổ đóng băng command.
Sau restore phải chạy reconciliation theo reference/hash; không mặc định snapshot ở các thời điểm khác
nhau là một legal record nhất quán.

### 8.2 MySQL

Dữ liệu tối thiểu gồm schema `law_app` và `law_app_crm`, cùng mọi schema mới được inventory.

Baseline production:

- full backup/snapshot định kỳ;
- binary log/PITR liên tục hoặc đủ tần suất để đáp ứng RPO đã duyệt;
- logical dump để kiểm tra khả chuyển, gồm routines, triggers, events và `utf8mb4`;
- snapshot transaction-consistent; với bảng không hỗ trợ transaction phải có biện pháp riêng;
- kiểm tra `mysqlcheck`, row count, constraint và invariant nghiệp vụ trên restore.

Credential dump phải lấy từ secret mount/backup identity, không truyền password trực tiếp trong command
line. Không chỉ sao chép volume của MySQL đang chạy nếu chưa dùng cơ chế snapshot nhất quán.

### 8.3 MongoDB

Inventory phải lấy từ cấu hình thực tế, tối thiểu hiện có thể gồm:

- database backend chat theo `SPRING_DATA_MONGODB_DATABASE`;
- `law-app-staff-chat`;
- `law-app-documents`.

`scripts/backup.sh` hiện không liệt kê `law-app-documents`, vì vậy không được xem là backup đầy đủ.
Production nên dùng replica set/managed backup với snapshot + oplog/PITR. `mongodump` trên standalone
không cung cấp cùng mức nhất quán/PITR.

Sau restore phải:

- tạo lại/kiểm tra index;
- đối chiếu collection count và audit event;
- đọc được template/version/generated document;
- giải mã được sample bằng đúng key ID;
- kiểm tra không có record legacy plaintext ngoài kế hoạch migration.

### 8.4 MinIO/S3

Bucket tối thiểu hiện có: `images`, `cvs`, `staff-files`, `document-templates` và
`generated-documents`.

Production cần:

- versioning và, với record class phù hợp, object lock/WORM + retention mode được Legal phê duyệt;
- replication sang site/account khác, bảo toàn object version, metadata, tag, checksum, retention và
  legal-hold state;
- server-side encryption/KMS nếu hạ tầng hỗ trợ, ngoài application encryption;
- inventory định kỳ theo bucket/version/hash; alert object missing, replication lag và policy drift;
- backup IAM/policy/config bằng IaC nhưng không backup plaintext secret.

Một lệnh mirror chỉ sao bản hiện hành, không bảo toàn version/object lock/hold thì không đủ cho legal
records.

### 8.5 Đánh giá script hiện có

`scripts/backup.sh` và `scripts/restore.sh` chỉ là công cụ local ban đầu, **không chạy trực tiếp trên
production** vì hiện:

- đọc `.env`, có password fallback mặc định và tạo backup plaintext trên cùng host;
- chỉ giữ theo số lượng mặc định, chưa có off-site, KMS, signature/manifest checksum hay PITR;
- bỏ sót database document mặc định;
- MinIO image hiện chỉ chứa binary `minio`, trong khi script gọi `mc` bên trong container; chưa có
  bằng chứng luồng này hoạt động;
- một số lỗi MinIO bị bỏ qua, không bảo toàn object versions/retention/legal hold;
- restore dùng thao tác ghi đè/`--drop`, chưa có guard môi trường, approval, preflight hay validation
  đầy đủ.

Chỉ được thay thế nhãn này sau khi pipeline mới được test end-to-end và evidence được review.

## 9. Khôi phục và kiểm thử khôi phục

### 9.1 Nguyên tắc an toàn

- Không thử restore lần đầu trong sự cố thật.
- Không restore trực tiếp đè production. Luôn dùng account/network/namespace cô lập, không có email,
  webhook hoặc egress có thể tác động người thật.
- Xác minh chữ ký/checksum, nguồn backup, malware scan và quyền truy cập trước restore.
- Ghi change/incident ID, restore point UTC, người thực hiện/phê duyệt và mọi sai lệch.
- Không dùng `scripts/restore.sh` trên production khi chưa có guard và phê duyệt riêng.

### 9.2 Quy trình restore drill

1. Chọn restore point theo tình huống; xác định checkpoint chung MySQL/Mongo/MinIO.
2. Cấp môi trường recovery sạch và secret/key từ escrow theo quy trình bốn mắt.
3. Restore MySQL vào schema/instance mới; không dùng `--drop` trên nguồn đang phục vụ.
4. Restore Mongo vào database mới, dựng index và kiểm tra collection.
5. Restore/attach MinIO vào bucket mới; không làm public bucket private.
6. Recreate RabbitMQ topology từ code/IaC. Không cần khôi phục Redis cache như source of truth; quyết
   định rõ token revocation/session sẽ bị invalidate hay restore.
7. Deploy đúng image digest tương thích với schema/backup.
8. Chạy đối chiếu và smoke test, chỉ dùng identity kiểm thử có audit.
9. Đo thời gian từ tuyên bố restore đến khi đạt acceptance; so với RTO.
10. Hủy môi trường recovery an toàn sau khi evidence được lưu; thu hồi toàn bộ quyền/secret tạm.

### 9.3 Acceptance bắt buộc

- Row/document/object count nằm trong sai số đã phê duyệt; mọi sai số có giải thích.
- Invariant `CustomerService.id == CrmCase.id == matterId` đúng trên mẫu đối chiếu.
- Generated document tham chiếu đúng immutable template version/input snapshot và SHA-256.
- Party và input tài liệu giải mã được bằng khóa hiện hành/lịch sử; ciphertext hỏng phải fail closed.
- Object hash/size/content type khớp manifest; tải qua API có authorization và `no-store`.
- CV/template/generated bucket không public; MinIO admin không truy cập từ Internet.
- Audit, outbox pending, inbox và DLQ còn nhất quán; duplicate event không tạo duplicate case.
- Đăng nhập, CSRF/revocation, matter assignment, template publish, generation, review/download hoạt
  động bằng dữ liệu synthetic.
- Không có email/webhook/thông báo đi ra từ môi trường recovery.

### 9.4 Tần suất bằng chứng

Tần suất cuối cùng phải bám RPO/RTO và risk assessment. Baseline đề xuất để phê duyệt:

- hằng ngày: kiểm tra backup job, tuổi bản mới nhất, replication và checksum;
- hằng tháng: restore tự động một sample DB/object và kiểm tra giải mã/hash;
- hằng quý: full restore cô lập, test ứng dụng và đo RTO;
- hằng năm hoặc sau thay đổi kiến trúc lớn: diễn tập DR/failover có Business, Legal, Security và SRE.

“Backup job thành công” không thay thế evidence restore thành công.

## 10. RPO, RTO và DR

### 10.1 Bảng quyết định

Các con số dưới đây là **đề xuất để BIA xem xét, chưa phải cam kết hoặc SLA**.

| Tier/dữ liệu | RPO đề xuất | RTO đề xuất | Trạng thái |
|---|---:|---:|---|
| P0 — identity, matter/case, party, outbox/inbox | ≤ 15 phút | ≤ 4 giờ | **Cần phê duyệt; chưa chứng minh** |
| P0 — template/version, generated legal document, audit, object legal | ≤ 15 phút | ≤ 4 giờ | **Cần phê duyệt; chưa chứng minh** |
| P1 — chat/staff file và chức năng nội bộ không tạo legal record | ≤ 4 giờ | ≤ 8 giờ | **Cần phê duyệt; chưa chứng minh** |
| P2 — public content/cache có thể tái dựng | ≤ 24 giờ | ≤ 8 giờ | **Cần phê duyệt; chưa chứng minh** |

Business Owner, Legal/Records, DPO/Security và SRE phải ký, ghi ngày hiệu lực và review tối thiểu hằng
năm hoặc khi phạm vi dữ liệu thay đổi. Nếu không chấp nhận các đề xuất, backup frequency, replication,
capacity và ngân sách phải được điều chỉnh tương ứng.

Docker Compose một node và script snapshot local hiện không chứng minh đáp ứng các mục tiêu trên.

### 10.2 Kiến trúc DR bắt buộc

- MySQL replica/managed multi-AZ và PITR; Mongo replica set/managed PITR.
- MinIO/S3 replication sang failure domain/account khác với version/retention/hold.
- Image, IaC, schema migration và Rabbit topology nằm trong repository/registry độc lập với site chính.
- Secret/KMS/escrow có kế hoạch region/site outage; không đặt khóa duy nhất cùng host với ciphertext.
- DNS/tunnel/certificate có quy trình chuyển site và chống split-brain.
- Capacity site DR đủ cho P0; giới hạn chức năng P1/P2 phải được business chấp thuận.

### 10.3 Trình tự failover

1. Incident Commander tuyên bố DR, ghi thời điểm bắt đầu RTO và fence site cũ khỏi mọi write.
2. Khôi phục IAM/KMS/secret/network tại site DR.
3. Promote/restore MySQL và Mongo đến checkpoint đã chọn.
4. Promote/restore object storage, xác minh replication/hash/hold.
5. Dựng Rabbit topology và Redis; replay từ outbox thay vì tin vào queue/cache cũ.
6. Deploy image theo digest, chạy migration `validate` và reconciliation.
7. Mở read-only cho kiểm tra, sau đó mới mở write theo go/no-go.
8. Theo dõi sát ít nhất một observation window đã duyệt; ghi data loss thực tế so với RPO.
9. Failback là một change riêng, không tự động chuyển lại khi site cũ vừa hoạt động.

## 11. Retention, legal hold và disposition

### 11.1 Trạng thái hiện tại

Soft archive, immutable template version và audit hiện có **không tương đương** một records-management
control đầy đủ. Chưa có enforcement toàn diện cho retention schedule, legal hold và controlled
disposition. MinIO app policy hiện còn quyền xóa object.

Cho đến khi control hoàn chỉnh:

- không bật job physical-delete tự động cho legal record;
- loại bỏ quyền hard-delete khỏi identity thường ngày;
- Records Manager duy trì hold register có kiểm soát và phê duyệt thủ công mọi ngoại lệ;
- bảo toàn object/version/audit liên quan theo phương án immutable đã phê duyệt;
- mọi yêu cầu xóa phải kiểm tra hold thủ công và có hai người duyệt.

### 11.2 Cấu hình retention

Không đặt một thời hạn chung. Mỗi schedule phải có:

- record class, service, jurisdiction và legal basis;
- trigger rõ ràng, thời lượng ISO-8601, effective dates và policy owner;
- phạm vi primary, replica, object version, index/search, export và backup;
- cách xử lý data-subject request, litigation/investigation và contractual hold;
- disposition method, approval hai người, checksum/tombstone không PII;
- quy tắc thay đổi schedule và xử lý record đã tồn tại.

Backup retention và business record retention là hai control khác nhau. Dữ liệu đã disposition có thể
còn trong backup immutable cho đến khi backup hết hạn; restore process phải ngăn dữ liệu đó tái hoạt
động ngoài policy.

### 11.3 Legal hold

Luồng tối thiểu:

1. Legal/Records phát hành hold có ID, lý do, scope, custodians, người phê duyệt và thời điểm UTC.
2. Resolve toàn bộ matter/document/version/object/audit/export/backup liên quan.
3. Gắn hold và chặn disposition/delete ở service, DB, MinIO lifecycle và mọi worker.
4. Thu acknowledgment, theo dõi record mới phát sinh và kiểm tra coverage định kỳ.
5. Mọi truy cập/đổi scope được audit; không ghi nội dung đặc quyền vào log vận hành.
6. Release cần Legal phê duyệt; không xóa ngay. Tính lại due date và đưa vào disposition queue.
7. Disposition chỉ chạy khi không còn hold, đủ hai approval độc lập và tạo evidence.

Legal hold luôn thắng retention/lifecycle. Backup/DR không được làm mất hold state.

## 12. Upload, quarantine và malware

### 12.1 Kiểm tra hiện có

Document-service kiểm tra DOCX ZIP/package: kích thước nén/giải nén, số entry, path traversal,
macro, embedded/ActiveX, external relationship và tỷ lệ zip bomb. Trước khi lưu template, hook
ClamAV `INSTREAM` quét bytes và fail closed khi scanner không sẵn sàng; Compose production cung cấp
scanner trên mạng private cùng volume signature. Structural validation và antivirus vẫn không thay
thế quarantine/CDR hoặc bằng chứng vận hành signature/EICAR.

### 12.2 Pipeline bắt buộc

```text
upload → private quarantine → MIME/signature/ZIP validation → AV sandbox/CDR
       → CLEAN + hash/audit → promote vào private immutable bucket
       → download qua API có authorization
```

Trạng thái tối thiểu: `QUARANTINED`, `SCANNING`, `CLEAN`, `REJECTED`, `SCAN_ERROR`. Chỉ `CLEAN` mới
được publish/render/download. Khi scanner timeout/không khả dụng phải fail closed, không tự coi là
sạch.

Control cần có:

- bucket/prefix quarantine riêng, không route public, không render/preview trực tiếp;
- tên object ngẫu nhiên, không chứa PII; SHA-256 ngay khi nhận;
- MIME detection từ bytes, allowlist loại file và giới hạn kích thước/ratio/entry;
- antivirus cập nhật signature, CDR/sandbox cho định dạng rủi ro;
- scanner chạy không đặc quyền, read-only, không network nếu không cần;
- promote bằng server-side copy có điều kiện theo hash/scan result;
- audit uploader, scanner/version, hash, kết quả và thời điểm; không log nội dung;
- retention ngắn cho file rejected nhưng vẫn đáp ứng incident/legal evidence;
- alert malware detected, signature quá cũ, scan backlog và scan fail/open attempt.

Kiểm thử bằng file EICAR chỉ trong môi trường cô lập, có approval; không tải malware thật lên
production.

### 12.3 Khi phát hiện malware

1. giữ file trong quarantine và vô hiệu hóa mọi URL/download;
2. mở incident, lưu hash/metadata và mẫu theo chain of custody trong evidence vault;
3. tìm cùng hash/source actor trên mọi bucket/matter, không mở file trên workstation;
4. cập nhật signature/rule và rescan phạm vi ảnh hưởng;
5. đánh giá credential/session và khả năng file đã được render/download;
6. Legal/DPO quyết định thông báo; Security quyết định tiêu hủy sau khi hết hold/evidence need.

## 13. Audit, log, metric và cảnh báo

### 13.1 Nguyên tắc log

- Dùng UTC và đồng bộ NTP; UI có thể hiển thị timezone địa phương.
- Log structured JSON với `timestamp`, service, environment, severity, `requestId`,
  `correlationId`, actor ID, action, resource ID và outcome.
- Không log Authorization/Cookie/CSRF, secret/key, request/response body, plaintext PII, nội dung hồ
  sơ hoặc presigned URL.
- Actor/resource ID được phép; email/phone/identity number phải mask hoặc không ghi.
- Log agent chỉ có append; operator/auditor read theo scope; retention và legal hold được cấu hình.
- Audit write failure phải có metric/alert. Không âm thầm coi business action là đã audit.

**Hiện có:** correlation ID xuất hiện trong logging pattern; service có health/readiness và Prometheus
endpoint; audit nằm trong MySQL/Mongo.

**Giới hạn:** chưa có pipeline log tập trung bất biến/SIEM và evidence chống sửa. Audit trong database
không chống được database admin. Cần export append-only tới storage/SIEM tách quyền, có checksum/sign
manifest hoặc WORM phù hợp.

### 13.2 Alert baseline

| Alert | Mức khởi đầu | Hành động |
|---|---|---|
| DLQ `crm.cases.dead` > 0 | Critical | Mở incident tích hợp; không purge. |
| Outbox pending lâu nhất > 5 phút / > 30 phút | Warning / Critical | Kiểm tra Rabbit, confirm, schema và `lastError`. |
| Encryption config `503` hoặc integrity/decryption error > 0 | High/Critical | Dừng rollout/write liên quan, kiểm tra key version; không log ciphertext/plaintext. |
| Audit write failure/gap | High | Chặn thao tác rủi ro nếu policy yêu cầu, mở incident. |
| Malware detected hoặc scanner fail closed | High | Quarantine playbook. |
| Backup quá tuổi so với RPO, checksum/replication lỗi | Critical | Khôi phục job; đánh giá vi phạm RPO. |
| Restore drill quá hạn/thất bại | High governance | Owner lập remediation có deadline. |
| Bulk PII read/download, denied access hoặc privilege change bất thường | High | Security review actor/session/matter scope. |
| MinIO policy/public access/admin login thay đổi | Critical | Revert/contain, đánh giá exposure. |
| Disk > 80/90%, certificate gần hết hạn, clock drift | Warning/Critical | Capacity/certificate/time playbook. |

Ngưỡng cuối cùng phải được tune bằng baseline và SLO đã phê duyệt. Alert phải có owner, runbook link,
deduplication, escalation và kiểm thử định kỳ; không chỉ gửi email không có người trực.

Dashboard tối thiểu:

- request/error/latency theo service và endpoint nhạy cảm;
- auth failure, 401/403, revocation và privilege change;
- generation/publish/workflow/download theo outcome;
- outbox count/oldest/attempt, Rabbit queue depth/consumer/DLQ;
- Mongo/MySQL connections, replication/PITR, lock/slow query;
- MinIO capacity, replication lag, 4xx/5xx, object/policy change;
- backup age/result/checksum và restore-drill status;
- audit ingest lag và malware scan backlog/signature age.

## 14. Outbox, inbox và DLQ

### 14.1 Cơ chế hiện có

- Backend ghi event vào MySQL `outbox_event` cùng transaction nghiệp vụ.
- Dispatcher mặc định quét mỗi giây, batch 50, dùng publisher confirm và retry exponential tối đa
  khoảng một giờ giữa các lần.
- Event đã publish được dọn sau 30 ngày; pending không được dọn bởi cleanup đó.
- CRM dùng durable queue `crm.cases` trên exchange `law-app.events`, retry tối đa 5 lần rồi dead-letter
  qua `law-app.events.dlx` vào `crm.cases.dead`.
- CRM lưu `eventId` trong inbox và bỏ qua duplicate; event cũ không overwrite projection mới hơn.

### 14.2 Xử lý outbox kẹt

1. Xác định oldest pending, số attempt, `lastError`, event type và aggregate; không copy payload PII
   vào ticket.
2. Kiểm tra Rabbit connectivity, publisher confirm/return, disk alarm, policy và schema consumer.
3. Sửa nguyên nhân; dispatcher sẽ retry. Không tự đặt `published_at`, xóa row hoặc giảm attempt bằng
   SQL để làm đẹp số liệu.
4. Chạy canary một aggregate, xác minh event ID ở inbox và CRM projection.
5. Nếu payload hỏng, bảo toàn row làm evidence và dùng corrective migration/reconciliation được review.
6. Nếu đã quá RPO/SLO, Incident Commander đánh giá impact và giao tiếp.

Retention 30 ngày của delivered outbox phải được Records/Security phê duyệt; nó không thay thế audit
retention.

### 14.3 Replay DLQ an toàn

1. Mở incident/change, ghi depth và snapshot metadata/header (`messageId`, `eventId`, `x-death`,
   original routing key); không purge.
2. Dừng hoặc giới hạn consumer/replay nếu cần để tránh storm.
3. Phân loại: lỗi tạm thời, schema, poison message, permission hay dữ liệu nghiệp vụ.
4. Sửa và deploy consumer tương thích trước.
5. Replay một canary về **exchange/routing key gốc**, giữ nguyên `eventId`/`messageId`; không publish
   payload đã sửa thủ công mà không có corrective-event design.
6. Xác minh inbox idempotency, case projection và audit; sau đó replay batch nhỏ có rate limit.
7. Chỉ ack/xóa bản DLQ sau publisher confirm và reconciliation thành công.
8. Lưu count trước/sau, event ID range, người thao tác, thời gian và kết quả.

Hiện chưa có operator tool replay được chuẩn hóa. Không dùng giao diện RabbitMQ với tài khoản root như
quy trình thường ngày; cần xây CLI/job có dry-run, RBAC, rate limit, audit và four-eyes.

## 15. Incident response và data breach

### 15.1 Tổ chức phản ứng

Vai trò tối thiểu: Incident Commander, Technical Lead, Security/Forensics, Legal/DPO, Records Manager,
Communications và scribe. Một người có thể kiêm trong tổ chức nhỏ nhưng quyết định pháp lý và thao tác
phá hủy phải giữ separation of duties.

### 15.2 Luồng chuẩn

1. **Phát hiện và phân loại:** ghi UTC, nguồn, scope sơ bộ, loại dữ liệu/matter, confidentiality,
   integrity, availability và safety.
2. **Bảo toàn bằng chứng:** snapshot/log/audit/hash, chain of custody, legal hold; không reboot/xóa
   trước khi Security quyết định nếu không cần để chặn thiệt hại.
3. **Containment:** thu hồi session/JIT access, disable credential, cô lập workload/bucket/path, chặn
   egress hoặc chuyển read-only. Không làm mất khả năng giải mã dữ liệu hợp pháp.
4. **Điều tra:** actor, thời gian, dữ liệu/đối tượng, jurisdiction, recipients, download/export,
   persistence và blast radius.
5. **Eradication/recovery:** vá, rotate, re-encrypt/rebuild sạch, restore/reconcile và tăng monitoring.
6. **Thông báo:** Legal/DPO quyết định cơ quan, khách hàng, đối tác và thời hạn theo matrix luật/hợp
   đồng. Không mặc định một thời hạn toàn cầu.
7. **Đóng sự cố:** xác nhận containment, data integrity, evidence, residual risk, postmortem và
   remediation có owner/deadline.

### 15.3 Playbook theo tình huống

**Credential/secret lộ**

- disable/rotate credential bị lộ và mọi secret tái sử dụng;
- tìm access log từ lần sử dụng hợp lệ cuối, kiểm tra CI/log/image/ticket;
- với encryption key, đánh giá toàn bộ ciphertext và backup phụ thuộc; dual-decrypt/re-encrypt trước
  khi revoke khóa cũ;
- kiểm tra attacker đã đổi IAM/policy, tạo credential hoặc presigned URL hay chưa.

**PII/legal document bị truy cập sai**

- khóa session/identity và matter scope; bảo toàn audit/download/object logs;
- xác định chính xác subject, trường dữ liệu, phiên bản, người nhận và khả năng lưu cục bộ;
- áp legal hold cho evidence; Legal/DPO điều phối nghĩa vụ thông báo và quyền chủ thể.

**Ransomware/corruption**

- fence writer/site bị ảnh hưởng; không để replication sao corruption sang DR nếu có thể;
- chọn restore point trước compromise, xác minh sạch và khóa truy cập;
- so hash/object version/audit, replay outbox có kiểm soát và reconcile.

**MinIO public exposure/policy drift**

- đóng tunnel/path/policy, không xóa log;
- inventory object/version có thể truy cập, access log và URL đã phát hành;
- rotate credential/presigned mechanism, xác minh mọi private bucket bằng deny test;
- Legal/DPO đánh giá breach dựa trên khả năng truy cập thực tế.

## 16. Kiểm tra sau deploy

### 16.1 Hạ tầng và bảo mật

- Tất cả liveness/readiness xanh; health/Prometheus không public ngoài monitoring network.
- Image digest, config version, migration version và secret key ID đúng release.
- TLS/certificate, cookie `Secure`/SameSite, CSRF, logout/revocation hoạt động.
- MinIO console/S3 admin không public; `cvs`, `document-templates`, `generated-documents` bị deny khi
  anonymous; app chỉ đọc/ghi đúng bucket.
- Không có root/secret ngoài scope trong environment; bootstrap admin đã gỡ.
- Log không chứa token, Cookie, key, PII hoặc document values.

### 16.2 Authorization

- `USER` không quản trị template/config và không đọc matter/party/tài liệu không được giao.
- Người được giao đọc được đúng matter; reassignment thu hồi quyền cũ.
- Reviewer/approver chỉ xử lý đúng task/version/hash.
- Author không tự publish/approve nếu policy yêu cầu separation.
- Auditor read-only; disposition/delete cần đúng role và hai approval.
- Denied access tạo audit/metric phù hợp nhưng không làm lộ sự tồn tại/nội dung hồ sơ.

### 16.3 Canary end-to-end

Dùng dữ liệu synthetic:

1. tạo intake/case và xác minh outbox được confirm;
2. CRM nhận đúng một projection/inbox event;
3. thêm party, xác minh DB không có plaintext và audit READ/CREATE;
4. upload template sạch, validate, publish immutable version;
5. sinh tài liệu với `Idempotency-Key`, retry cùng request trả cùng kết quả;
6. tải tài liệu qua API được phép, headers `no-store`/`nosniff`, SHA-256 đúng;
7. chuyển review/approval đúng actor và audit;
8. thử truy cập bằng user ngoài matter phải bị từ chối;
9. xác minh outbox không kẹt, DLQ trống, audit ingest không lag;
10. xác minh backup/replication job tiếp theo vẫn hoạt động.

Health probe không thay thế canary mã hóa: CRM/document có thể boot nhưng trả `503` tại endpoint nhạy
cảm khi key thiếu hoặc sai.

### 16.4 Go/no-go sau rollout

Release Manager chỉ kết thúc observation window khi:

- không có integrity/decryption/audit/malware error;
- error/latency/queue/outbox nằm trong threshold;
- reconciliation không có record/object thiếu hoặc duplicate;
- canary authorization allow/deny đều đúng;
- backup mới thành công và alert routing đã test;
- evidence package đã gắn vào change.

## 17. Evidence và tuyên bố tuân thủ

### 17.1 Evidence tối thiểu

Mỗi release:

- change/approval, commit và image digest, dependency lock/SBOM;
- CI/test/a11y/secret/vulnerability scan và ngoại lệ có expiry;
- migration plan/result, row count/invariant và rollback decision;
- backup ID/checksum/restore evidence;
- policy/IAM diff, key ID/version (không có secret);
- post-deploy canary, allow/deny test, dashboard/alert snapshot;
- incident/DLQ/reconciliation record nếu có.

Định kỳ:

- access review, break-glass test và offboarding evidence;
- key/credential inventory và rotation evidence;
- backup/restore/DR report với RPO/RTO thực đo;
- retention schedule, legal hold acknowledgment/release và disposition evidence;
- audit integrity/ingest check, malware signature/scan test;
- supplier/KMS/object-storage assurance, risk assessment, DPIA/data map và đào tạo.

Evidence phải có timestamp UTC, owner, reviewer, scope, kết quả, checksum/signature và retention; ảnh
chụp màn hình rời rạc không đủ nếu không gắn với nguồn/phiên bản.

### 17.2 Disclaimer chứng nhận

Repository, tài liệu kiến trúc và runbook này **không chứng minh và không tuyên bố hệ thống đã đạt**
ISO 15489, ISO 16175, ISO/IEC 27001, SOC 2 hoặc bất kỳ chứng nhận/chuẩn pháp lý nào.

Các tài liệu chỉ là baseline kỹ thuật tham chiếu. Chứng nhận/attestation còn cần scope chính thức,
policy được ban hành, risk assessment, phân công trách nhiệm, data governance, hợp đồng nhà cung cấp,
đào tạo, evidence vận hành qua thời gian, kiểm tra restore/DR, xử lý nonconformity và đánh giá độc
lập bởi bên có thẩm quyền. Mọi tuyên bố đối ngoại phải được Legal, Security và đơn vị chứng nhận phê
duyệt bằng văn bản.

## 18. Biên bản phê duyệt production

Không điền “đã phê duyệt” nếu chưa có chữ ký/e-signature hợp lệ và evidence liên kết.

| Hạng mục | Owner | Quyết định/giá trị | Ngày hiệu lực | Evidence |
|---|---|---|---|---|
| Scope dữ liệu/jurisdiction | Legal/DPO | Chưa phê duyệt |  |  |
| RPO/RTO P0/P1/P2 | Business + SRE | Chưa phê duyệt |  |  |
| Retention schedule | Records + Legal | Chưa phê duyệt |  |  |
| Legal-hold procedure | Legal + Records | Chưa phê duyệt |  |  |
| Backup/restore/DR | SRE + Security | Chưa chứng minh |  |  |
| IAM/separation of duties | Security + Business | Chưa hoàn tất |  |  |
| Malware/quarantine | Security + SRE | Chưa triển khai đầy đủ |  |  |
| Production go-live | Release Board | Chưa phê duyệt |  |  |

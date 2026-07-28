# Báo cáo review source code Law App

**Repository:** [Babychandoi/law-app](https://github.com/Babychandoi/law-app)  
**Nhánh:** [`phong/staff-chat-service`](https://github.com/Babychandoi/law-app/tree/phong/staff-chat-service)  
**Commit được đánh giá:** [`73a39d2`](https://github.com/Babychandoi/law-app/commit/73a39d2450da5da800c0a4b553d599fe8c30de37)  
**Ngày đánh giá:** 17/07/2026  
**Vai trò đánh giá:** PM + Senior Developer, DevOps/SRE và khách hàng khó tính

---

## 0. TRẠNG THÁI CẬP NHẬT (27/07/2026)

Chú thích: ✅ đã xong (đã kiểm chứng) · ⚠️ làm một phần · ⬜ chưa làm.

### P0 (mục 3)
- 3.1 Khóa riêng trong Git → ⬜ **CHƯA** — cần chủ repo/DevOps revoke+xoay key và `git filter-repo` (không sửa được bằng code).
- 3.2 Admin credential hardcode → ✅ (env-based, không log mật khẩu).
- 3.3 WebSocket giả mạo guest/admin → ✅ (danh tính suy ra server-side, ACL SUBSCRIBE/SEND, chặn senderType từ client).
- 3.4 File chat public → ✅ (bucket private + presigned URL).
- 3.5 Stored XSS CMS → ✅ sanitize (DOMPurify, có unit test) · ⚠️ CSP ở Nginx/edge chưa xác nhận.
- 3.6 Nguy cơ create-drop DB → ⚠️ **cần chủ repo xác minh** biến môi trường prod là `validate`/`none`; migration versioned (Flyway) ⬜.

### Bảo mật/RBAC bổ sung (mục 4)
- ✅ Vá RBAC: update user, CMS write, subscriber (@PreAuthorize) — **đã test thật: nhân viên bị 403**.
- ✅ Rò rỉ PII `/jobs/applications`, `/news/subscribers` → nay 401 khi chưa đăng nhập (đã kiểm trên prod).
- ✅ Mật khẩu chuyển sang body; chặn tài khoản INACTIVE; sửa refresh expiry.
- ⬜ Khóa HS512 dùng chung giữa service; validation issuer/audience — chưa (kiến trúc).

### DevOps/Test (mục 5, 7)
- ✅ CI GitHub Actions (build/lint/format); ✅ Prometheus/Grafana (opt-in); ✅ correlation ID; ✅ rate limit;
  ✅ bounded AI executor; ✅ Redis SCAN; ✅ health/readiness; ✅ backup/restore script; ✅ tối ưu N+1 chat.
- ✅ **Test**: từ 1 test → **unit 61 + E2E 9** (login/RBAC/DataTable/chat directory). Trước đây gần như không có.
- ⬜ Flyway/Liquibase; ⬜ bỏ container_name + replica/scale; ⬜ circuit breaker đầy đủ; ⬜ load-test CCU.

### UX/Privacy (mục 6)
- ✅ Trang chính sách bảo mật; ✅ AI disclosure (bỏ giả làm người thật); ✅ SEO OG/Twitter/canonical + sitemap động + 404 noindex; ✅ chatbox a11y cơ bản.
- ⬜ Form cho phép 1 trong 2 (SĐT/email) + fallback dịch vụ; ⬜ SSR/prerender; ⬜ tracking consent.

**Tóm tắt:** phần lỗi bảo mật P0 xử-lý-bằng-code đã đóng và **kiểm chứng thật trên prod**. Còn lại cần
**chủ repo/DevOps**: xoay khóa TLS/ACME (3.1), xác minh cấu hình DB prod (3.6), và các hạng mục hạ tầng/scale.

---

## 1. Kết luận điều hành

Tại commit được đánh giá, nhánh **chưa đủ điều kiện merge hoặc deploy production**.

Hệ thống thể hiện nhiều ý tưởng kỹ thuật tốt: phân tách microservice, RabbitMQ broker relay, MongoDB index, route-based code splitting, HTTP-only cookie kết hợp CSRF và tối ưu cache frontend. Tuy nhiên, mức sẵn sàng production hiện chỉ khoảng **3/10** vì còn lỗi bảo mật nghiêm trọng, CI không qua, gần như không có test và kiến trúc triển khai chưa đáp ứng tải lớn.

Phạm vi nhánh quá lớn:

- Đi trước `main` 56 commit.
- Thay đổi 614/622 file.
- Khoảng `+74.197 / -15.171` dòng.
- Trộn staff chat, CRM, document service, CMS, redesign/revert UI, performance và deployment trong cùng một nhánh.

## 2. Bảng điểm

| Hạng mục | Điểm | Nhận xét |
|---|---:|---|
| Tổ chức kiến trúc | 5.5/10 | Có phân service và tài liệu migration, nhưng đang hybrid và trùng lặp nhiều |
| Chất lượng code | 4/10 | Có TypeScript strict và phân lớp, nhưng nhiều file khổng lồ, lỗi xử lý chung chung |
| Tốc độ frontend | 7/10 | Code-splitting, ảnh tối ưu, cache tốt; main bundle khoảng 58 KB gzip |
| Khả năng mở rộng backend | 3/10 | N+1, cập nhật tuần tự, thiếu atomic update và nhiều API không phân trang |
| Security & privacy | 1/10 | Có nhiều lỗ hổng đủ để chặn phát hành |
| Test & CI | 1/10 | Một test cho 442 file Java/TS/TSX, không có GitHub Actions |
| DevOps/SRE | 3/10 | Có Docker và memory cap, nhưng single-node, thiếu telemetry, backup và readiness |
| Trải nghiệm khách hàng | 6/10 | Giao diện có định hướng tốt, nhưng trust, privacy, chat và SEO còn yếu |

**Mức sẵn sàng production tổng thể: 3/10 — Không duyệt phát hành.**

## 3. P0 — Các vấn đề cần xử lý ngay

### 3.1. Khóa riêng đã nằm trong Git — ⬜ CHƯA (cần DevOps xoay khóa + filter-repo)

TLS private key từng được commit trong lịch sử Git; khóa tài khoản ACME vẫn được track ở nhánh hiện tại. Xóa file trong commit mới không làm khóa trong lịch sử hết giá trị.

Hành động bắt buộc:

1. Revoke và xoay certificate/private key.
2. Xoay khóa tài khoản ACME.
3. Xóa khóa khỏi toàn bộ lịch sử bằng `git filter-repo` hoặc BFG.
4. Force-push có kiểm soát và yêu cầu mọi thành viên clone/fetch lại.
5. Bật secret scanning và kiểm tra những nơi khóa đã được sử dụng.

### 3.2. Tài khoản admin mặc định có credential công khai — ✅ ĐÃ SỬA

[`ApplicationInitConfig.java`](https://github.com/Babychandoi/law-app/blob/73a39d2450da5da800c0a4b553d599fe8c30de37/backend/src/main/java/org/law_app/backend/security/ApplicationInitConfig.java) tự tạo tài khoản admin bằng mật khẩu hardcode và còn ghi mật khẩu vào log.

Hành động bắt buộc:

- Bỏ hoàn toàn username/password khỏi source.
- Đổi hoặc khóa tài khoản đã được tạo ở môi trường đang chạy.
- Không ghi mật khẩu vào log.
- Dùng quy trình bootstrap một lần với secret bên ngoài repository và bắt buộc đổi mật khẩu.

### 3.3. WebSocket có thể giả mạo guest/admin — ✅ ĐÃ SỬA

[`ChatWebSocketConfig.java`](https://github.com/Babychandoi/law-app/blob/73a39d2450da5da800c0a4b553d599fe8c30de37/backend/src/main/java/org/law_app/backend/websocket/ChatWebSocketConfig.java) tin trực tiếp vào `guestId` hoặc `adminId` do client gửi. [`ChatController.java`](https://github.com/Babychandoi/law-app/blob/73a39d2450da5da800c0a4b553d599fe8c30de37/backend/src/main/java/org/law_app/backend/controller/ChatController.java) cũng tin `senderType=ADMIN` từ payload.

Rủi ro:

- Khách chưa đăng nhập có thể gửi tin dưới vai trò admin.
- Có thể vô hiệu hóa AI của một cuộc trò chuyện.
- Có thể subscribe `/topic/admin/messages` để nhận chat của khách khác.
- Notification WebSocket nhận `userId` từ query string mà không xác thực.
- Staff chat xác thực khi `CONNECT` nhưng không kiểm tra membership khi `SUBSCRIBE`.

Hướng sửa:

- Danh tính và vai trò phải được suy ra server-side.
- Dùng signed guest session hoặc guest token có thời hạn.
- Kiểm tra ACL cho từng lệnh `SEND` và `SUBSCRIBE`.
- Chỉ cho subscribe conversation khi principal là thành viên.
- Ngắt session WebSocket khi token bị thu hồi hoặc tài khoản bị khóa.

### 3.4. File chat nội bộ đang public — ✅ ĐÃ SỬA

[`docker-compose.yml`](https://github.com/Babychandoi/law-app/blob/73a39d2450da5da800c0a4b553d599fe8c30de37/docker-compose.yml) đặt bucket `staff-files` thành anonymous public.

Đây có thể là hợp đồng, hồ sơ hoặc giấy tờ pháp lý. Cần:

- Chuyển bucket sang private.
- Dùng presigned URL có thời hạn ngắn.
- Kiểm tra magic byte, loại file, kích thước và quota.
- Quét malware.
- Có lifecycle và cơ chế xóa file mồ côi.

### 3.5. Stored XSS từ nội dung CMS — ✅ ĐÃ SANITIZE (⚠️ CSP edge chưa xác nhận)

`news.fullContent` được đưa vào `dangerouslySetInnerHTML` nhưng không tìm thấy bước sanitize ở frontend hoặc backend. Nội dung độc hại có thể chạy trong trình duyệt của khách và admin.

Cần:

- Sanitize bằng allowlist ở backend.
- Dùng DOMPurify hoặc cơ chế tương đương ở frontend.
- Nâng cấp rich-text dependency.
- Bổ sung Content Security Policy tại Nginx/edge.

### 3.6. Nguy cơ xóa database do cấu hình — ⚠️ CẦN CHỦ REPO XÁC MINH

`.env.example` để `SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop`, trong khi không có Flyway/Liquibase. Nếu giá trị này lọt vào production, database có thể bị tạo lại khi service restart.

Cần xác minh ngay cấu hình thực tế, dùng `validate` hoặc `none` ở production và quản lý schema bằng migration có version.

## 4. Đánh giá từ góc nhìn PM + Senior Developer

### 4.1. Điểm làm tốt

- Có tài liệu thừa nhận rõ kiến trúc hybrid và kế hoạch gom traffic về gateway.
- Staff chat có cursor pagination cho lịch sử, MongoDB compound index và unique `directKey`.
- RabbitMQ STOMP relay là hướng đúng cho WebSocket nhiều instance.
- CRM consumer dùng idempotent upsert khi nhận lại event.
- Document service kiểm tra phần mở rộng, content type, kích thước và ZIP magic.
- Frontend có lazy route, TypeScript strict, URL tập trung và ảnh được tối ưu.
- Cookie `httpOnly` kết hợp CSRF double-submit tốt hơn lưu token trong localStorage.
- Public API có cơ chế edge cache cho một số dữ liệu không phụ thuộc người dùng.

### 4.2. Điểm chưa đạt

#### Quản lý phạm vi thay đổi

Nhánh gần như thay toàn bộ repository và chứa nhiều mục tiêu không liên quan. Điều này làm tăng đáng kể xác suất regression, conflict và khó rollback.

Nên tách ít nhất thành các PR:

1. Security và authentication.
2. Staff chat.
3. CRM.
4. Document service.
5. Frontend/CMS/UI.
6. Infrastructure và deployment.

#### Tổ chức code

- Có cả `service/` và `services/` ở frontend.
- Có client riêng cho monolith và gateway.
- Authentication/security code được sao chép qua nhiều service.
- Không có root Maven aggregator/BOM hoặc shared security library.
- Một số file quá lớn:
  - `ServiceEditor.tsx`: 1.065 dòng.
  - `ChatBox.tsx`: 757 dòng.
  - `Chat.tsx`: 748 dòng.
  - `ChatbotAIServiceImpl.java`: 567 dòng.
- Có file tạm `ChildrenServiceImpl.java.tmp...` được commit.
- Khoảng 43.000 dòng `.github/skills/impeccable` không liên quan runtime nhưng nằm trong nhánh sản phẩm.

#### Chất lượng code

- Nhiều nơi bắt `Exception` rồi trả về error code không đúng nguyên nhân.
- Còn nhiều `System.out.println` và log chứa định danh người dùng.
- Tên thương hiệu, domain và thuật ngữ cũ/mới còn lẫn nhau.
- DTO được gom thành một lớp lồng lớn để “brevity”, làm giảm khả năng tìm kiếm và bảo trì.
- Không có idempotency cho một số thao tác public như tạo lead, gửi chat hoặc nộp hồ sơ.

#### Phân quyền

- User đã đăng nhập có thể sửa thông tin của user khác qua endpoint update user.
- News create/update/delete không được giới hạn rõ cho admin.
- Endpoint subscriber được comment là “Admin only” nhưng không có `@PreAuthorize` tương ứng.
- Group chat chỉ kiểm tra “là thành viên”, chưa kiểm tra OWNER/ADMIN khi thêm, xóa thành viên hoặc gắn CRM case.

#### Token và mật khẩu

- Mật khẩu mới được gửi qua query string, dễ lọt vào proxy/access log và hỏng với ký tự đặc biệt.
- Tài khoản `INACTIVE` chưa bị chặn rõ khi login hoặc refresh.
- Refresh flow bỏ qua thời hạn JWT trong khi Redis giữ token 30 ngày.
- Các microservice cùng giữ khóa HS512, nên service bị chiếm quyền có thể tự ký token.
- Issuer vẫn mang tên domain/thương hiệu cũ và chưa thấy validation issuer/audience ở service con.

## 5. Đánh giá từ góc nhìn DevOps/SRE

### 5.1. Điểm tốt

- Java runtime chạy bằng user non-root.
- Dockerfile dùng multi-stage build.
- Có JVM `MaxRAMPercentage` và memory limit cho phần lớn Java service.
- MySQL, Redis, RabbitMQ và MinIO có healthcheck cơ bản.
- Cloudflare tunnel có keepalive.
- Static assets được cache dài hạn; `index.html` không cache.
- RabbitMQ queue của CRM là durable.
- Redis có AOF.

### 5.2. Nỗi đau khi lượng người dùng tăng

| Luồng | Hiện trạng | Hậu quả khi tải cao | Khuyến nghị |
|---|---|---|---|
| Staff chat gửi tin | Ghi message + conversation, sau đó lặp từng member để save và notify | Độ trễ tăng tuyến tính theo số member; unread count race | Atomic `$inc`, bulk update, transaction/outbox |
| Staff inbox | Membership rồi tải conversation và membership cho từng dòng | Dạng `2N+1`, tăng số truy vấn MongoDB | Aggregation/projection và cursor pagination |
| Guest chat AI | Mỗi câu hỏi đọc nhiều bảng bằng `findAll`, đọc lịch sử rồi gọi AI | DB, thread pool và AI provider cùng bị nghẽn | Cache prompt data, bounded executor, timeout và circuit breaker |
| AI execution | `CompletableFuture.runAsync` dùng common pool và `Thread.sleep(1500)` | Pool bị giữ, không có backpressure | Executor riêng có queue giới hạn, bỏ sleep khỏi worker |
| Presence | Redis `KEYS presence:staff:*` | Có thể block Redis khi keyspace lớn | `SCAN`, sorted set hoặc presence registry |
| Document generation | DOCX được xử lý đồng bộ và trả thành `byte[]` | Nhiều file lớn dễ vượt memory 700 MB | Job queue, giới hạn concurrency và streaming |
| Public lead/chat | Không rate limit hoặc CAPTCHA | Spam làm tăng DB, email và AI cost | Rate limit theo IP/session, quota và WAF rule |
| CRM event | Fire-and-forget, không outbox/publisher confirm/DLQ rõ ràng | CRM có thể thiếu hoặc nhận phantom event | Transactional outbox, confirm, retry và DLQ |

### 5.3. Khả năng scale hạ tầng

- Mọi service có `container_name`, khiến Docker Compose không thể scale nhiều replica cùng service.
- Gateway và các application đều single instance.
- MySQL, MongoDB, Redis, RabbitMQ và MinIO đều single-node.
- Gateway hiện là single point of failure; tài liệu dự án cũng đã thừa nhận rủi ro này.
- Chưa có app-level health/readiness check cho backend, gateway, chat, CRM, document và frontend.
- `depends_on` chủ yếu đảm bảo thứ tự khởi động, không đảm bảo ứng dụng đã sẵn sàng phục vụ.

### 5.4. Quan sát và vận hành

Không tìm thấy cấu hình đầy đủ cho:

- Prometheus metrics.
- Distributed tracing.
- Correlation/request ID.
- Centralized logging.
- SLO/SLI và alerting.
- Backup/restore drill.
- Rate limiting tập trung.
- Circuit breaker và bulkhead.

Ngoài ra:

- MySQL, MongoDB và MinIO publish cổng trực tiếp ra host.
- Một số image dùng tag `latest`, làm build không tái lập.
- Không có CPU limit.
- Frontend và Cloudflare container không có memory limit.
- Các Dockerfile Java đều build bằng `-DskipTests`.
- Frontend Dockerfile dùng npm mirror bên thứ ba, tăng rủi ro supply-chain.

## 6. Đánh giá từ góc nhìn khách hàng khó tính

### 6.1. Điểm được

- Màu sắc và cách trình bày có định hướng chuyên nghiệp, phù hợp dịch vụ pháp lý.
- CTA gọi điện, Zalo và form tư vấn rõ ràng.
- Có cam kết phản hồi trong 24 giờ và giải thích bước tiếp theo.
- Form có label, autocomplete, thông báo lỗi và kích thước nút phù hợp mobile.
- Có skip link, focus style và `prefers-reduced-motion`.
- Có trạng thái gửi thành công/thất bại và kênh liên hệ trực tiếp khi API lỗi.
- Route được lazy-load, ảnh được tối ưu và static asset được cache tốt.

### 6.2. Điểm cần cải thiện

#### Form tư vấn

- Bắt buộc cả điện thoại, email và dịch vụ, tạo ma sát cao.
- Nếu API danh sách dịch vụ lỗi, khách không thể gửi form.
- Không có lựa chọn “Dịch vụ khác”.
- Không lưu nháp khi refresh hoặc mất kết nối.

Nên cho phép khách cung cấp một trong hai kênh điện thoại/email và có fallback service chung.

#### Privacy và niềm tin

- Không thấy trang/link chính sách riêng tư hoặc điều khoản cạnh form.
- Website tải Google/Facebook/TikTok tracking nhưng không thấy cơ chế quản lý consent.
- Nếu bật chatbot AI, [`ChatbotAIServiceImpl.java`](https://github.com/Babychandoi/law-app/blob/73a39d2450da5da800c0a4b553d599fe8c30de37/backend/src/main/java/org/law_app/backend/service/impl/ChatbotAIServiceImpl.java) yêu cầu AI giả làm “người thật” và không tự nhận là AI.
- Nội dung chat được gửi tới AI provider nhưng chưa có thông báo rõ cho khách.

Với một dịch vụ pháp lý, việc AI giả người thật là vấn đề niềm tin nghiêm trọng. Nên công khai đây là trợ lý AI, phạm vi giới hạn và việc dữ liệu có thể được xử lý bởi nhà cung cấp bên thứ ba.

#### Chatbox

- Input chưa có label/`aria-label`.
- Message container chưa có `aria-live`.
- Thiếu dialog semantics, focus trap và phục hồi focus khi đóng.
- Một số nút icon chỉ dùng `title`.
- Trạng thái connected vẫn hiển thị nội dung gần giống “đang kết nối”.
- Bảo mật guest ID và public topic làm suy giảm mạnh niềm tin dù giao diện đẹp.

#### SEO và khả năng tìm kiếm

- Website là CRA client-side SPA, chưa có SSR/prerender.
- Public HTML chủ yếu là JavaScript shell.
- SEO component thiếu canonical, Open Graph và Twitter metadata.
- `sitemap.xml` chứa URL literal `:id` cho tin tuyển dụng và tin tức.
- Không có route 404 thực sự; catch-all `:slug` có thể nhận cả URL sai.
- Nội dung động từ CMS không được tự động đưa vào sitemap.

#### Trải nghiệm tải trang

- Route fallback tạo vùng trắng khoảng 40% chiều cao màn hình.
- Chưa có Error Boundary tổng thể cho lỗi lazy chunk hoặc render.
- Những widget liên hệ/chat nổi có nguy cơ gây chật màn hình mobile nếu cùng mở.

### 6.3. Giới hạn đánh giá UX

Phiên kiểm tra không truy cập được website bằng trình duyệt trực tiếp trong môi trường đánh giá. Vì vậy, phần UX được đánh giá từ source, production build và HTML công khai; không coi lỗi truy cập này là bằng chứng website production đang down.

## 7. Kết quả kiểm chứng kỹ thuật

### 7.1. Frontend

- `npm ci --legacy-peer-deps`: thành công.
- `npm run lint`: exit code 0 nhưng có 3 React Hooks warning.
- `CI=true npm run build`: thất bại vì CI coi 3 warning là error.
- Prettier check: 36 file không đạt.
- `npm test -- --watchAll=false --runInBand`: 1 test pass.
- Test phát cảnh báo React về prop `fetchPriority`.
- Non-CI production build: thành công.
- Main JavaScript khoảng 57,6 KB gzip.
- Tổng JavaScript của tất cả route khoảng 393 KB gzip.

### 7.2. Dependency audit

`npm audit --omit=dev` báo 360 dependency node bị ảnh hưởng:

- 5 critical.
- 63 high.
- 178 moderate.
- 114 low.

Đây là số dependency node, không phải 360 CVE độc lập. Nhiều lỗi thuộc CRA/build toolchain, nhưng Axios, React Quill, router và một số dependency runtime cũng bị ảnh hưởng.

### 7.3. Test và CI

- Chỉ có một test trong toàn bộ repository.
- Có 442 file Java/TS/TSX.
- Không có test backend, staff chat, CRM hoặc document service.
- Không có `.github/workflows`.
- Không có Maven Wrapper.
- Không có root Maven aggregator.

### 7.4. Giới hạn kiểm chứng backend

Backend chưa được compile/test runtime độc lập trong môi trường đánh giá vì:

- Project yêu cầu Java 21.
- Môi trường chỉ có Java 17.
- Không có Maven hoặc Docker.
- Repository không cung cấp Maven Wrapper.

Do đó, đánh giá backend dựa trên static source review, cấu hình và luồng dữ liệu. Các Dockerfile hiện cũng chủ động bỏ qua test khi build.

## 8. Kế hoạch xử lý đề xuất

### Giai đoạn 0 — Trong 24 giờ

1. Revoke/xoay TLS certificate, TLS private key và ACME account key.
2. Đổi/khóa default admin credential.
3. Tạm khóa hoặc giới hạn guest WebSocket dễ giả mạo.
4. Chuyển `staff-files` thành private.
5. Kiểm tra production không dùng `create-drop`.
6. Tạo backup database và xác minh khả năng restore.
7. Kiểm tra log/proxy để xác định credential hoặc dữ liệu có thể đã bị lộ.

### Giai đoạn 1 — Trong tuần đầu

1. Thiết kế lại WebSocket authentication và destination ACL.
2. Sanitize CMS HTML và triển khai CSP.
3. Sửa RBAC cho user, CMS, subscriber và group chat.
4. Sửa refresh expiry, inactive account và password request body.
5. Thêm rate limit cho login, lead, chat, upload và AI.
6. Nâng cấp dependency có lỗ hổng.
7. Thêm GitHub Actions cho build, test, format, secret scan và dependency scan.

### Giai đoạn 2 — Trong 2 đến 4 tuần

1. Tách nhánh thành các PR nhỏ có rollback plan.
2. Dùng Flyway/Liquibase cho database migration.
3. Thêm health/readiness, metrics, tracing, correlation ID và alert.
4. Thiết lập backup/restore drill.
5. Tối ưu staff chat bằng aggregation, bulk/atomic update và pagination.
6. Dùng bounded executor, timeout, retry và circuit breaker.
7. Chuyển document generation sang job queue có giới hạn concurrency.
8. Bỏ `container_name`, triển khai load balancing và replica phù hợp.
9. Bổ sung privacy policy, AI disclosure, tracking consent, SSR/prerender và sitemap động.

## 9. Điều kiện để được duyệt phát hành

Nhánh chỉ nên được duyệt khi đáp ứng tối thiểu:

- Toàn bộ P0 đã được đóng và kiểm chứng lại.
- Credential/key đã được xoay, không chỉ xóa khỏi commit mới.
- Frontend CI build, lint và format đều xanh.
- Tất cả Java service compile và test thành công mà không dùng `-DskipTests` trong release gate.
- Có test cho auth, WebSocket ACL, chat, CRM event và document permission.
- Dependency/secret scan không còn critical blocker.
- Có migration và backup/restore plan.
- Có health/readiness, metrics và cảnh báo tối thiểu.
- Có load-test theo CCU thực tế, ghi nhận p95/p99, error rate và message loss.
- Có review UX/privacy cho form, chatbot AI và tracking.

## 10. Phán quyết cuối cùng

Đội ngũ đã có tư duy cải thiện performance và bước đầu tách microservice tốt. Tuy nhiên, nhánh hiện tại mở rộng quá nhanh so với mức trưởng thành của security, test và vận hành.

**Không nên merge/deploy production cho đến khi toàn bộ P0 được xử lý và CI xanh.**

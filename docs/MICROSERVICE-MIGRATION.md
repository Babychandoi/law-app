# Lộ trình migrate sang single-entry-point microservice

> Trạng thái hiện tại (2026-06-16): hệ thống chạy **hybrid**. Monolith vẫn được FE gọi
> trực tiếp; chỉ chat nội bộ đi qua gateway. Tài liệu này là kế hoạch để **sau này** gom
> mọi traffic về một entry point duy nhất (gateway) khi muốn đẩy hết về microservice.

## 1. Hiện trạng (hybrid — đang chạy)

```
                    ┌─────────────────────────┐
  FE (axiosClient)  │   api.luatpoip.com       │ ──► monolith (backend:8080)   [THẲNG]
                    └─────────────────────────┘
                    ┌─────────────────────────┐
  FE (gatewayClient)│ gateway.luatpoip.com     │ ──► gateway (8081)
                    └─────────────────────────┘        ├─ /staff-chat/** ─► chat-service:8082
                                                        └─ (đã cấu hình sẵn route tới monolith
                                                            nhưng FE CHƯA dùng)
```

- FE gọi **2 host**: `REACT_APP_API_URL=https://api.luatpoip.com` và
  `REACT_APP_GATEWAY_URL=https://gateway.luatpoip.com`.
- Gateway **đã** có route tĩnh tới monolith (`/auth`, `/services`, `/service`, `/jobs`,
  `/news`, `/customer`, `/notifications`, `/upload`, `/chat`) — đã test 200/401 — nhưng FE
  chưa trỏ vào đó.

## 2. Đích đến (single entry point)

```
  FE (mọi client) ──► gateway.luatpoip.com ──┬─ /staff-chat/** ─► chat-service
                                             ├─ /ws-staff/**   ─► chat-service (WS)
                                             ├─ /ws/**         ─► monolith (WS guest chat)
                                             └─ mọi path khác   ─► monolith
```

- `api.luatpoip.com` có thể giữ (nội bộ, hoặc deprecate dần) nhưng FE không dùng nữa.
- Thêm service mới sau này: chỉ cần thêm 1 route ở gateway, FE không đổi host.

## 3. Việc cần làm khi migrate (ước lượng nhỏ — đa số là đổi env)

### 3.1 Frontend (chủ yếu đổi env build-time, gần như KHÔNG sửa code)
FE đã tham chiếu env tập trung; chỉ cần trỏ các biến này về gateway rồi rebuild image:

| Biến | Hiện tại | Sau migrate |
|------|----------|-------------|
| `REACT_APP_API_URL` | `https://api.luatpoip.com` | `https://gateway.luatpoip.com` |
| `REACT_APP_WS_URL` | `wss://api.luatpoip.com/ws/notifications` | `wss://gateway.luatpoip.com/ws/notifications` |
| `REACT_APP_CHAT_WS_URL` | `https://api.luatpoip.com/ws` | `https://gateway.luatpoip.com/ws` |
| `REACT_APP_GATEWAY_URL` | `https://gateway.luatpoip.com` | (giữ nguyên) |
| `REACT_APP_STAFF_WS_URL` | `https://gateway.luatpoip.com/ws-staff` | (giữ nguyên) |

Các file FE phụ thuộc (chỉ để kiểm chứng, không cần sửa nếu chỉ đổi env):
`service/axiosClient.ts`, `service/admin.ts`, `component/chat/ChatBox.tsx`,
`page/admin/home/sections/{Chat,Navbar,Customer}.tsx`.

> Cân nhắc: gộp `axiosClient` và `gatewayClient` thành một (cùng baseURL gateway). Lúc đó
> `gatewayClient.ts` có thể bỏ, `teamChat.ts` chuyển sang dùng `axiosClient`. Tùy chọn, không bắt buộc.

### 3.2 Gateway
- Route monolith đã có sẵn — **không cần thêm gì** cho các nghiệp vụ hiện tại.
- Bổ sung route `/ws/**` → monolith (ĐÃ có route `monolith-ws`), kiểm tra WS guest-chat +
  notifications hoạt động qua gateway (test kỹ vì WS nhạy với header/timeout).
- Cân nhắc thêm: rate-limit, request logging tập trung, JWT pre-check tại gateway (hiện mỗi
  service tự verify — vẫn ổn, nhưng gateway có thể chặn sớm để giảm tải).

### 3.3 Hạ tầng (nginx/cloudflared)
- `gateway.luatpoip.com` đã sống (tunnel route thẳng `gateway:8081`).
- Khi FE chuyển hẳn sang gateway: có thể bỏ ingress `api.luatpoip.com` khỏi
  `cloudflared/config.yml` (hoặc giữ cho gọi nội bộ/debug).
- CORS: gateway `globalcors` đã cho phép origin FE — đảm bảo đủ origin khi gom.

### 3.4 Kiểm thử trước khi cắt (checklist)
- [ ] Login/refresh token qua gateway (`/auth/login`, `/auth/refresh`).
- [ ] Upload ảnh (`/upload`) — body lớn, không bị giới hạn ở gateway (`httpclient` + size).
- [ ] WS guest chat (`/ws`) + notifications (`/ws/notifications`) qua gateway: upgrade header,
      `response-timeout` (LƯU Ý: ở SCG 2025.0.0 `0s` = timeout tức thì, phải để giá trị thực).
- [ ] Tất cả trang admin (services, news, customer, jobs, subscribers) gọi data OK.
- [ ] Đo độ trễ thêm do qua 1 hop gateway (thường không đáng kể nội mạng Docker).

## 4. Rủi ro & lưu ý
- **Single point of failure**: gateway chết → toàn hệ thống chết. Cân nhắc chạy ≥2 instance
  gateway + health check khi traffic lớn.
- **WebSocket qua gateway** dễ lỗi nhất (đã gặp 504 do `response-timeout: 0s`). Test riêng.
- Cắt theo kiểu **canary**: đổi env FE ở 1 môi trường staging trỏ gateway, chạy song song,
  verify hết checklist rồi mới đổi prod + rebuild FE image.
- Giữ `api.luatpoip.com` sống trong thời gian chuyển tiếp để rollback nhanh (chỉ cần đổi env
  FE về lại và rebuild).

## 5. Tóm tắt: vì sao migrate sẽ dễ
- FE đã tham chiếu URL qua env tập trung → đổi giá trị, không đổi code.
- Gateway đã route sẵn tới monolith → không cần code thêm cho nghiệp vụ cũ.
- Pattern đã được chứng minh chạy được (chat nội bộ đã đi qua gateway end-to-end).

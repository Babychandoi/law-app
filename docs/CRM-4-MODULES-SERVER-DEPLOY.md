# Quy trình Kiểm tra & Triển khai 4 Phân hệ CRM trên Server (`luatpoip.com`)

Tài liệu này hướng dẫn **AI vận hành trên server** (hoặc quản trị viên) kiểm tra, build, migrate tự động và nghiệm thu bản cập nhật **4 Phân hệ CRM cốt lõi** (`KH Liên hệ`, `Khách hàng 360°`, `Cơ hội HĐ`, `Hợp đồng & Sổ Thu chi`).

---

## 1. Tóm tắt Kiến trúc Thay đổi

1. **`crm-service` (Backend Java 21 / Spring Boot 3.5 — Database MySQL `law_app_crm`)**:
   - Giữ nguyên **100% tương thích ngược** với toàn bộ bảng & API cũ (`/crm/cases/**`, `/crm/config/**`, `/crm/users`).
   - Bổ sung 9 bảng nghiệp vụ mới trong `law_app_crm` (tự động tạo qua Hibernate `CRM_JPA_DDL_AUTO=update`):
     - `crm_lead` (KH Liên hệ — tự động đồng bộ 2 chiều/chống trùng từ `crm_case` khi khách gửi form Website)
     - `crm_account` & `crm_account_contact` (Khách hàng 360° & Người liên hệ)
     - `crm_opportunity` & `crm_opportunity_item` (Cơ hội HĐ — Danh sách + Kanban 7 giai đoạn tư vấn pháp lý)
     - `crm_contract`, `crm_contract_item`, `crm_contract_cashflow` (Hợp đồng `PD...` + Bảng dịch vụ + 3 Sổ Thu chi: `THUC_THU`, `DU_KIEN_CHI`, `THUC_CHI`)
     - `crm_activity` (Nhật ký tương tác Cuộc gọi / Nhiệm vụ / Lịch hẹn / Email / Ghi chú dùng chung cho 4 phân hệ)
   - Dữ liệu mẫu demo (`CrmEnterpriseSeedRunner`) **mặc định tắt trên Production** (`CRM_SEED_DEMO_ENABLED=false`) để không chèn dữ liệu giả vào DB thật; riêng luồng đồng bộ khách thật từ `crm_case` sang `crm_lead` luôn chạy tự động và an toàn (idempotent theo `source_case_id`).

2. **`frontend` (React + TypeScript — Route `/2025/luatpoip/crm/*`)**:
   - Bổ sung không gian làm việc CRM 4 vùng theo bố cục MISA AMIS CRM nhưng chuẩn hóa theo Design System Luật Poip Legal (`DESIGN.md`).
   - Lối vào trực tiếp từ Sidebar Vận hành (`/2025/luatpoip/admin` → **Quản lý CRM (4 phân hệ)**) hoặc bảng lệnh `Ctrl+K`.
   - Các đường dẫn chính:
     - `/2025/luatpoip/crm/lead` — KH Liên hệ
     - `/2025/luatpoip/crm/account` — Khách hàng 360°
     - `/2025/luatpoip/crm/opportunity` — Cơ hội HĐ (Danh sách & KanBan 7 bước)
     - `/2025/luatpoip/crm/sale-order` — Hợp đồng & Sổ Thu chi

3. **`gateway`**:
   - Không cần sửa cấu hình vì `gateway` đã định tuyến sẵn toàn bộ `/crm/**` sang `http://law-app-crm:8083`.

---

## 2. Quy trình Triển khai Từng bước trên Server

### Bước 1: Kiểm tra trạng thái hiện tại & Sao lưu DB `law_app_crm`

Chạy tại thư mục gốc dự án trên server (ví dụ `/opt/law-app` hoặc `~/law-app`):

```bash
cd /path/to/law-app
git status
docker compose ps
```

Đảm bảo database `law_app_crm` đã tồn tại và tạo bản backup trước khi cập nhật schema:

```bash
mkdir -p backups
source .env

# Đảm bảo DB law_app_crm tồn tại và user MySQL có quyền
docker exec law-app-mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
  CREATE DATABASE IF NOT EXISTS law_app_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  GRANT ALL PRIVILEGES ON law_app_crm.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
"

# Sao lưu dữ liệu hiện tại của law_app_crm
docker exec law-app-mysql mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction --routines --triggers law_app_crm \
  > "backups/law_app_crm_pre_4modules_$(date +%Y%m%d_%H%M%S).sql"
ls -lh backups/law_app_crm_pre_4modules_*.sql
```

---

### Bước 2: Pull code mới & Kiểm tra biến môi trường `.env`

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Kiểm tra nhanh các biến trong `.env` trên server:
1. `CRM_JPA_DDL_AUTO`: Nên để `update` (hoặc không khai báo — `docker-compose.yml` đã mặc định `CRM_JPA_DDL_AUTO:-update` riêng cho `crm-service` để không bị biến `SPRING_JPA_HIBERNATE_DDL_AUTO` của `backend` ghi đè).
2. `CRM_SEED_DEMO_ENABLED`:
   - **Trên Production thật**: giữ `CRM_SEED_DEMO_ENABLED=false` (mặc định) để chỉ đồng bộ khách thật từ `crm_case`, không tạo bản ghi mẫu.
   - **Trên môi trường Staging / Demo**: có thể đặt `CRM_SEED_DEMO_ENABLED=true` nếu muốn tự động tạo dữ liệu mẫu 4 phân hệ khi bảng trống.
3. Kiểm tra `frontend/.env.production` đảm bảo `REACT_APP_GATEWAY_URL=https://gateway.luatpoip.com` và `REACT_APP_API_URL=https://api.luatpoip.com`.

---

### Bước 3: Build & Khởi động lại `crm-service` và `frontend`

Sử dụng script chuẩn `rebuild.sh` của dự án (tự build, `up -d` và dọn Docker build cache):

```bash
chmod +x ./rebuild.sh
./rebuild.sh crm-service frontend
```

*(Lưu ý: Nếu trước đó có chỉnh sửa `frontend/.env.production`, chạy `./rebuild.sh --no-cache frontend`).*

Nếu `nginx` cache upstream IP của container `frontend` mới, reload nhẹ `nginx`:

```bash
docker exec law-app-nginx nginx -s reload
```

---

### Bước 4: Kiểm tra Healthcheck, Logs & Schema MySQL

1. **Đợi `law-app-crm` lên trạng thái `healthy`**:
   ```bash
   docker ps --filter "name=law-app-crm" --filter "name=law-app-frontend" --filter "name=law-app-gateway"
   docker logs --tail=80 law-app-crm
   ```
   - Kiểm tra trong log không có `Exception` lúc khởi động và có dòng `Started CrmServiceApplication`.

2. **Kiểm tra Actuator Health nội bộ**:
   ```bash
   docker exec law-app-crm wget -qO- http://localhost:9100/actuator/health
   ```
   Kết quả mong đợi: `{"status":"UP",...}`.

3. **Xác nhận đủ 9 bảng mới trong `law_app_crm`**:
   ```bash
   source .env
   docker exec law-app-mysql mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" law_app_crm -e "SHOW TABLES;"
   ```
   Phải có mặt đầy đủ:
   - `crm_lead`
   - `crm_account`
   - `crm_account_contact`
   - `crm_opportunity`
   - `crm_opportunity_item`
   - `crm_contract`
   - `crm_contract_item`
   - `crm_contract_cashflow`
   - `crm_activity`
   *(cùng các bảng cũ `crm_case`, `care_status`, `care_action`, `care_result`, `care_log`, `tag`, `matter_party`...).*

---

### Bước 5: Nghiệm thu API End-to-End (Smoke Test Không Để Lại Rác)

AI trên server thực hiện kiểm tra xác thực & luồng 4 phân hệ qua Gateway:

1. **Kiểm tra chặn truy cập trái phép (phải trả về `401`)**:
   ```bash
   curl -i -s https://gateway.luatpoip.com/crm/contracts | head -n 5
   curl -i -s https://gateway.luatpoip.com/crm/leads | head -n 5
   ```

2. **Nếu có tài khoản Admin/Staff để kiểm thử tự động** (lưu cookie đăng nhập vào `/tmp/crm_cookies.txt`, sau khi test xong xóa sạch bản ghi test và xóa file cookie):
   ```bash
   # 1) Đăng nhập lấy httpOnly cookie + XSRF-TOKEN
   curl -s -c /tmp/crm_cookies.txt -H "Content-Type: application/json" \
     -d '{"username":"<ADMIN_USER>","password":"<ADMIN_PASS>"}' \
     https://api.luatpoip.com/auth/token >/dev/null

   # Gọi 1 GET để nhận XSRF-TOKEN từ crm-service nếu cần
   curl -s -b /tmp/crm_cookies.txt -c /tmp/crm_cookies.txt \
     https://gateway.luatpoip.com/crm/catalog/services | head -c 300; echo

   XSRF=$(awk '/XSRF-TOKEN/ {print $7}' /tmp/crm_cookies.txt | tail -n 1)

   # 2) Kiểm tra danh sách 4 phân hệ, bộ lọc động (?filters=), thùng rác (?deleted=true) & API cũ vẫn trả code 200
   for ep in "/crm/cases?page=0&size=5" \
             "/crm/leads?page=0&size=5" \
             "/crm/leads?deleted=true&page=0&size=5" \
             "/crm/accounts?page=0&size=5" \
             "/crm/opportunities?page=0&size=5" \
             "/crm/opportunities/kanban" \
             "/crm/contracts?page=0&size=5" \
             "/crm/contracts?filters=%5B%7B%22field%22%3A%22orderValue%22%2C%22op%22%3A%22GTE%22%2C%22value%22%3A%220%22%7D%5D&page=0&size=5"; do
     echo "=== GET $ep ==="
     curl -s -b /tmp/crm_cookies.txt "https://gateway.luatpoip.com${ep}" | head -c 240; echo
   done

   # 3) Dọn file cookie tạm
   rm -f /tmp/crm_cookies.txt
   ```

3. **Kiểm tra Frontend Bundle**:
   ```bash
   curl -I -s https://luatpoip.com/2025/luatpoip/crm/sale-order | head -n 5
   ```
   Kết quả mong đợi: `HTTP/2 200` (SPA `index.html` được phục vụ bình thường qua Nginx).

---

## 3. Checklist Nghiệm thu Giao diện cho Người dùng

Sau khi AI trên server báo hoàn tất Bước 1–5, mở trình duyệt đăng nhập `/2025/luatpoip/admin/login` và kiểm tra nhanh:
- [ ] Vào **Quản lý CRM (4 phân hệ)** ở menu trái (`/2025/luatpoip/crm/sale-order`): Sidebar thu gọn/mở rộng mượt, hiển thị đúng 4 mục `KH Liên hệ`, `Khách hàng`, `Cơ hội HĐ`, `Hợp đồng`.
- [ ] **3 Chế độ xem (`Danh sách` · `KanBan` · `Sửa nhanh`) trên cả 4 phân hệ**:
  - `Danh sách`: Bảng rộng cuộn ngang ghim cột Checkbox trái & Thao tác phải.
  - `KanBan`: Kéo thả thẻ chuyển trạng thái/giai đoạn trên cả 4 phân hệ (trên Hợp đồng có thể nhóm theo *Tình trạng thực hiện HĐ* hoặc *Tình trạng ghi doanh số*).
  - `Sửa nhanh`: Chỉnh sửa trực tiếp trên các ô bảng và bấm `Lưu thay đổi` hàng loạt.
- [ ] **Menu chọn Giao diện (`YÊU THÍCH` · `CHIA SẺ VỚI TÔI` · `TẠO BỞI TÔI` · `+ Thêm giao diện`) & Màn hình `← Sửa giao diện`**:
  - Bấm `Sửa` cạnh tiêu đề mở bảng chọn 2 cột `Có sẵn` ↔ `Được chọn` cho cả **Cột hiển thị** và **Trường tính Tổng KPI đáy bảng** (12 chỉ số tiền tệ trên Hợp đồng) + **Sắp xếp dữ liệu theo** (*Tăng dần / Giảm dần*).
- [ ] **Bộ lọc bên phải (`ĐÃ LƯU` + `TIÊU CHÍ LỌC` + `── Xem thêm ──` + Biểu đồ nhanh)**:
  - Hiển thị đủ toàn bộ cột chính (16 cột trên Hợp đồng, 12 trên KH Liên hệ & Khách hàng, 9 trên Cơ hội HĐ), bấm `Xem thêm` mở rộng thêm 10–26 trường phụ, hỗ trợ toán tử lọc chi tiết và lưu bộ lọc riêng.
- [ ] **Menu mở rộng `...` góc phải (7 chức năng)**:
  - `Thống kê nhanh`, `Bàn giao công việc`, `Xóa hàng loạt`, `Quản lý chia sẻ`, `Quản lý thẻ`, `In` và **`Thùng rác`** (xóa mềm, khôi phục hoặc xóa vĩnh viễn).

---

## 4. Phương án Rollback Nhanh (Nếu phát sinh sự cố)

Vì toàn bộ thay đổi DB chỉ **thêm bảng mới** (`crm_lead`, `crm_account*`, `crm_opportunity*`, `crm_contract*`, `crm_activity`) và không xóa/đổi kiểu bất kỳ cột cũ nào của `crm_case`:
```bash
git revert --no-edit HEAD
./rebuild.sh crm-service frontend
```
Hệ thống cũ (`/2025/luatpoip/admin/crm`) vẫn hoạt động bình thường ngay lập tức mà không cần khôi phục lại dump MySQL.

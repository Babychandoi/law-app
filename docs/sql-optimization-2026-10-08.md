# Kiểm tra và tối ưu SQL — 08/10/2026

## Kết quả đo trên máy đang chạy

- Grafana đã dừng; backend, gateway, CRM, chat, documents và MySQL đang healthy.
- MySQL uptime khoảng 965.472 giây (~11,2 ngày); 21 kết nối, 2 thread chạy tại thời điểm lấy mẫu.
- Buffer pool 128 MiB. Có 1.173 lần đọc từ đĩa trên 4.181.260 yêu cầu đọc (~0,028%). Chưa có bằng chứng cần tăng buffer pool.
- `slow_query_log=OFF`, ngưỡng 10 giây. `Slow_queries=0` không đủ kết luận mọi API đều nhanh. Dùng thống kê digest sẵn có, không bật log hay thay cấu hình production.
- Ước lượng từ metadata: 17 CustomerService, 17 crm_case, 81 NotificationUser, 0 crm_case_tag. Dữ liệu hiện còn nhỏ.
- Digest outbox: 962.186 lần gọi, tổng khoảng 617 giây, trung bình 0,641 ms/lần. Truy vấn rẻ nhưng hỏi nền liên tục khi bảng trống.
- NotificationUser theo người dùng: 10 lần, trung bình 9,805 ms; truy vấn Notification riêng: 510 lần, trung bình 1,277 ms. Phù hợp với việc tải toàn bộ thông báo và đọc quan hệ từng mục.
- Tag CRM theo từng case: 90 lần, trung bình 0,718 ms. Không thể quy timeout 20 giây cho SQL chỉ từ các mẫu này.

## Thay đổi code đã chuẩn bị

| Luồng | Thay đổi |
|---|---|
| Khách hàng | EntityGraph cho đúng `findAll(spec, pageable)`, tải customer/service cùng danh sách, không fetch collection nên giữ phân trang SQL |
| CRM | Một truy vấn `caseId IN (...)` cho toàn bộ tag của trang; trang trống không hỏi bảng tag |
| Dashboard | API `/customer/stats` tổng hợp COUNT theo status. Bỏ bốn request danh sách size=1 để lấy số đếm; vẫn dùng tổng hồ sơ đăng ký dịch vụ như trước |
| Dashboard khi API lỗi | Các phần thành công cập nhật độc lập; lỗi chat không xóa số đếm/danh sách khách hàng |
| Thông báo | Badge dùng COUNT chưa đọc; danh sách chỉ tải khi mở, 5 mục/trang, Xem thêm lấy trang kế tiếp; tải gộp các quan hệ mapper đọc |
| Tương thích | Giữ API `/notifications` cũ; frontend mới dùng `/notifications/page` và `/notifications/unread-count` |
| Outbox | Mặc định 1.000 → 5.000 ms, giảm khoảng 80% lượt polling. Có thể thêm tối đa khoảng 4 giây chờ đồng bộ CRM. Property cấu hình hiện có vẫn ghi đè được |

## EXPLAIN thực tế

- Danh sách CustomerService: scan 17 dòng và filesort; customer/service nối bằng primary key (`eq_ref`). Với bảng nhỏ, optimizer chọn scan là hợp lý.
- Thống kê GROUP BY status: `Using index` trên `idx_customer_service_status`.
- Thông báo theo người dùng: dùng index user_id, ước lượng 51 dòng; quan hệ nối primary key; filesort để sắp createdAt/id. LIMIT 5 giới hạn số bản ghi/quan hệ cần chuyển DTO.
- COUNT chưa đọc: dùng index user_id, lọc reader.
- Tag CRM: scan bảng trống; chưa có index caseId trong database thực tế.

## Index production: chưa áp dụng

Database thực tế dùng `crm_case_tag.caseId/tagId`, `crm_case.assignedUserId/nextFollowUpAt/caseCreatedAt`. Các annotation index/unique CRM lại dùng tên snake_case. Database hiện thiếu một số index dự kiến; digest ghi nhận DDL đã được thử. Không tự đổi naming strategy hoặc thêm annotation vì `ddl-auto=update` có thể làm thay đổi schema khi khởi động.

Với lượng dữ liệu hiện tại, ưu tiên triển khai code giảm số request/truy vấn. Nếu dữ liệu tăng, cân nhắc:

1. Index `(caseId, tagId)` cho tag CRM; trước unique constraint phải kiểm tra cặp trùng và null. Chỉ thêm index thường nếu chưa quyết định quy tắc dữ liệu.
2. Index `NotificationUser(user_id, createdAt, id)` cho danh sách; `(user_id, reader)` cho badge khi lịch sử lớn.
3. Index CRM theo bộ lọc và thứ tự phổ biến sau khi đo workload; chưa thêm hàng loạt index theo phỏng đoán.

Mỗi index cần xem EXPLAIN trên dữ liệu lúc áp dụng, kiểm tra tên cột/tên index và lên kế hoạch thao tác. DDL có thể chờ metadata lock, tăng I/O và làm chậm thao tác ghi.

## Triển khai và xác minh sau triển khai

Đã triển khai production ngày 08/10/2026, hoàn tất kiểm tra khoảng 23:17 giờ Việt Nam, sau khi người dùng đồng ý. Backend và CRM healthy; frontend running. MySQL, gateway, chat và các dịch vụ khác không khởi động lại. Grafana vẫn exited, đã gọi stop lại theo yêu cầu người dùng.

Trước triển khai, backend và CRM kế thừa `ddl-auto=update` và `PhysicalNamingStrategyStandardImpl`. Đã áp dụng `docker-compose.sql-optimization.yml`: generate-ddl=false và ddl-auto=none ở backend/CRM, giữ naming strategy hiện tại. Đã đối chiếu SHA256 của metadata toàn bộ cột và index ở cả law_app/law_app_crm trước và sau triển khai: không đổi. Không thêm index hoặc sửa schema production.

Đã dùng ba compose file: `docker-compose.yml`, `docker-compose.frontend-prebuilt.yml`, `docker-compose.sql-optimization.yml`, đóng gói JAR đã test bằng Dockerfile.prebuilt và runtime cũ; frontend dùng bundle có đủ prerender. Chỉ cập nhật backend/crm-service/frontend với --no-deps --no-build. Các lệnh triển khai tiếp theo cần giữ cả ba override cho tới khi schema/queue có migration riêng.

Sau triển khai: homepage HTTP 200 (~0,65 giây); API public /service/children HTTP 200 (~0,96 giây). /customer/stats, /notifications/page và gateway /crm/cases trả 401 khi không đăng nhập, không còn 502 sau khi backend khởi động. Trang quản trị chuyển đúng đến trang login. Chưa có phiên đăng nhập nên chưa đo end-to-end Dashboard/khách hàng/CRM/thông báo có xác thực. Các luồng này đã có test trước triển khai; cần theo dõi khi người dùng đăng nhập sử dụng.

Đối chiếu SHA256 JAR backend, JAR CRM cuối cùng và frontend index.html trong container đều khớp artifact host. Backend outbox đo thực tế: 18 lượt truy vấn trong 95 giây (~5,28 giây/lượt), xác nhận nhịp polling mới.

### Tương thích RabbitMQ phát hiện trong lúc triển khai

Queue production crm.cases có arguments trống. Code hiện tại khai báo x-dead-letter-exchange/routing-key nên lần khởi động đầu gặp PRECONDITION_FAILED dù health UP. Đã thêm lựa chọn app.rabbitmq.case-queue-dead-letter-arguments (mặc định true cho queue mới); override production đặt false để giữ queue cũ. Bổ sung hai tests cấu hình queue, chạy toàn bộ CRM tests và đóng gói lại rồi cập nhật riêng CRM.

Đã tạo policy crm-case-dead-letter, priority 10, chỉ match ^crm[.]cases$: dead-letter-exchange=law-app.events.dlx, dead-letter-routing-key=crm.cases.dead. Queue/binding crm.cases.dead được code tạo bình thường. Xác minh crm.cases có 1 consumer, 0 message pending; dead queue tồn tại và binding đúng. Log container CRM cuối cùng không còn lỗi PRECONDITION_FAILED/ERROR trong cửa sổ kiểm tra. Không xóa hoặc purge queue. Policy có thể gỡ riêng bằng clear_policy nếu cần, giữ nguyên queue và dữ liệu.

### Hoàn nguyên

Giữ ba image cũ: law-app-backend:sql-rollback-20261008, law-app-crm-service:sql-rollback-20261008, law-app-frontend:sql-rollback-20261008. Nếu cần, retag từng image cũ về latest tương ứng rồi chạy compose up -d --no-deps --no-build với cùng ba compose file và ba service; không build lại, không xóa volume. Chưa thực hiện hoàn nguyên.

## Kiểm tra

- Backend: 15 tests qua; CRM: 29 tests qua, gồm hai tests RabbitMQ bổ sung. Bao gồm case tổng hợp trạng thái, trang thông báo/unread count và tag CRM cho trang nhiều case/trang trống.
- TypeScript `--noEmit`: qua. Hai test frontend mới qua: Dashboard giữ phần thành công khi chat lỗi; thông báo chỉ tải badge lúc mount và phân trang khi người dùng mở/Xem thêm/Thu gọn.
- Backend và CRM đóng gói JAR thành công bằng Maven offline.
- Frontend production bundle: compile thành công. Sandbox ban đầu chặn spawn tiến trình con; build lại với quyền được duyệt đã qua. Không cập nhật dependency để xử lý cảnh báo Browserslist cũ vì ngoài phạm vi thay đổi này.
- Cấu hình ba compose file được xác minh bằng `config --quiet` và đã áp dụng production.
- Prerender HTML SEO qua cho cả ba trang tĩnh: /ve-chung-toi (981 từ), /lien-he (604 từ), /chinh-sach-bao-mat (981 từ). Mỗi trang đạt kiểm tra H1 và số từ của script hiện có.

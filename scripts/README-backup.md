# Backup & Restore — law-app

Bộ script sao lưu/khôi phục toàn bộ dữ liệu trạng thái: **MySQL** (monolith + CRM),
**MongoDB** (guest chat, staff chat, **tài liệu**), **MinIO** (ảnh, CV, template, tài liệu sinh ra,
file chat).

## Sao lưu

```bash
bash scripts/backup.sh
```

- Kết quả: `backups/<YYYYmmdd_HHMMSS>/` gồm `mysql/`, `mongodb/`, `minio/`, `README.txt` và bản
  `restore.sh` tự chứa.
- Mật khẩu đọc từ `.env` (không hardcode). Không commit `backups/` (đã có trong `.gitignore`).
- Giữ lại `BACKUP_KEEP` bản mới nhất (mặc định 7).

Phạm vi (khớp `backup.sh`):

| Nguồn | Đối tượng |
|---|---|
| MySQL | `law_app`, `law_app_crm` |
| MongoDB | `law-app-staff-chat`, `law_app_chat`, `law-app-documents` |
| MinIO | `images`, `cvs`, `document-templates`, `generated-documents`, `staff-files` |

### Lịch tự động (cron trên host)

```cron
0 2 * * *  cd /path/law-app && bash scripts/backup.sh >> backups/backup.log 2>&1
```

### Sao lưu ngoài site (khuyến nghị)

Backup nội bộ chỉ chống mất dữ liệu ứng dụng, **không** chống hỏng máy chủ. Đẩy bản mới nhất ra nơi
khác sau mỗi lần backup, ví dụ:

```bash
# S3/MinIO ngoài site
mc cp --recursive "backups/$(ls -1t backups | head -1)" offsite/law-app-backups/
# hoặc rsync sang máy khác
rsync -az "backups/$(ls -1t backups | head -1)" user@host:/srv/law-app-backups/
```

## Khôi phục (⚠️ GHI ĐÈ dữ liệu hiện tại)

`restore.sh` dùng `mongorestore --drop`, import MySQL và `mc mirror --overwrite` — **phá dữ liệu đang
có**. Chỉ chạy khi thực sự muốn thay thế.

```bash
# Cách 1: chạy bản restore.sh tự chứa trong thư mục backup
cd backups/20260731_160033 && bash restore.sh

# Cách 2: trỏ tới thư mục backup
BACKUP_DIR=backups/20260731_160033 bash scripts/restore.sh
```

## Kiểm thử restore AN TOÀN (không đụng prod)

Nghiệm thu "restore đã kiểm thử" nên làm trên **stack rác/staging**, không phải prod:

1. Dựng stack thứ hai (đổi project name + cổng), hoặc trên máy staging:
   ```bash
   docker compose -p lawapp-restore-test up -d mysql mongodb minio minio-setup
   ```
2. Trỏ script vào container của stack test rồi restore:
   ```bash
   MYSQL_CT=lawapp-restore-test-mysql-1 \
   MONGO_CT=lawapp-restore-test-mongodb-1 \
   MINIO_CT=lawapp-restore-test-minio-1 \
   BACKUP_DIR=backups/20260731_160033 bash scripts/restore.sh
   ```
3. Kiểm chứng: đếm bản ghi Mongo/MySQL + liệt kê object MinIO khớp bản gốc; mở thử 1 tài liệu.
4. Xoá stack test: `docker compose -p lawapp-restore-test down -v`.

> Không chạy `restore.sh` trực tiếp lên prod để "kiểm thử" — chỉ dùng khi khôi phục thật sau sự cố.

## Đã kiểm chứng

- `backup.sh` đã chạy thật (2026-07-31): MySQL 2 DB, Mongo 3 archive (gzip hợp lệ), MinIO 5 bucket.
- `restore.sh` là quy trình khôi phục; **kiểm thử restore cần chạy trên stack staging** theo mục trên
  (không thực hiện trên prod để tránh phá dữ liệu).

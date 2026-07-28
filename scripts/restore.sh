#!/usr/bin/env bash
# ============================================================
#  RESTORE dữ liệu law-app từ một thư mục backup.
#  Đặt script này TRONG thư mục backup (backup.sh tự copy vào) rồi chạy:
#     bash restore.sh
#  Hoặc trỏ tới thư mục backup:  BACKUP_DIR=backups/20260724_153540 bash scripts/restore.sh
#  ⚠️ GHI ĐÈ dữ liệu hiện tại (mongorestore --drop, mysql import).
# ============================================================
set -euo pipefail
cd "${BACKUP_DIR:-$(dirname "$0")}"

# Nạp mật khẩu từ .env gốc nếu chạy qua scripts/ (nếu không, dùng biến môi trường / mặc định).
for envf in ../../.env ../.env ./.env; do [ -f "$envf" ] && { set -a; . "$envf"; set +a; break; }; done
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-12345678}"
MONGO_USER="${MONGO_USER:-root}"
MONGO_PASSWORD="${MONGO_ROOT_PASSWORD:-12345678}"
MINIO_USER="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_PASSWORD="${MINIO_SECRET_KEY:-minioadmin}"
MYSQL_CT="${MYSQL_CT:-law-app-mysql}"
MONGO_CT="${MONGO_CT:-law-app-mongodb}"
MINIO_CT="${MINIO_CT:-law-app-minio}"

echo "==> [1/3] MySQL"
for f in mysql/*.sql; do
  echo "    - $f"
  docker exec -i "$MYSQL_CT" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 < "$f"
done

echo "==> [2/3] MongoDB"
for f in mongodb/*.archive.gz; do
  echo "    - $f"
  docker exec -i "$MONGO_CT" sh -c \
    "mongorestore -u $MONGO_USER -p '$MONGO_PASSWORD' --authenticationDatabase admin --archive --gzip --drop" < "$f"
done

echo "==> [3/3] MinIO"
docker cp minio/. "$MINIO_CT":/tmp/miniorestore/
docker exec "$MINIO_CT" sh -c "
  mc alias set local http://localhost:9000 $MINIO_USER $MINIO_PASSWORD >/dev/null 2>&1
  for b in \$(ls /tmp/miniorestore); do
    mc mb --ignore-existing local/\$b >/dev/null 2>&1
    mc mirror --overwrite /tmp/miniorestore/\$b local/\$b
  done
  mc anonymous set public local/images >/dev/null 2>&1 || true
  rm -rf /tmp/miniorestore
"
echo "==> HOÀN TẤT restore."

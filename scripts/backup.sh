#!/usr/bin/env bash
# ============================================================
#  BACKUP dữ liệu law-app (MySQL + MongoDB + MinIO)
#  Chạy trên host khi stack đang chạy:
#     bash scripts/backup.sh
#  Kết quả: backups/<YYYYmmdd_HHMMSS>/ (khớp định dạng restore.sh).
#  Có thể cron: 0 2 * * *  cd /path/law-app && bash scripts/backup.sh >> backups/backup.log 2>&1
# ============================================================
set -euo pipefail

# Chạy từ thư mục gốc law-app (script nằm trong scripts/)
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

# --- Nạp mật khẩu từ .env (không hardcode) ---
if [ -f .env ]; then set -a; . ./.env; set +a; fi
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-12345678}"
MONGO_PASSWORD="${MONGO_ROOT_PASSWORD:-12345678}"
MONGO_USER="${MONGO_USER:-root}"
MINIO_USER="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_PASSWORD="${MINIO_SECRET_KEY:-minioadmin}"

MYSQL_CT="${MYSQL_CT:-law-app-mysql}"
MONGO_CT="${MONGO_CT:-law-app-mongodb}"
MINIO_CT="${MINIO_CT:-law-app-minio}"

MYSQL_DBS=(law_app law_app_crm)
MONGO_DBS=(law-app-staff-chat law_app_chat law-app-documents)
MINIO_BUCKETS=(images cvs document-templates generated-documents staff-files)

KEEP="${BACKUP_KEEP:-7}" # số bản backup giữ lại

TS="$(date +%Y%m%d_%H%M%S)"
DEST="$ROOT/backups/$TS"
mkdir -p "$DEST/mysql" "$DEST/mongodb" "$DEST/minio"
echo "==> Backup -> $DEST"

echo "==> [1/3] MySQL"
for db in "${MYSQL_DBS[@]}"; do
  echo "    - $db"
  docker exec "$MYSQL_CT" mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction --routines --triggers --default-character-set=utf8mb4 "$db" \
    > "$DEST/mysql/$db.sql"
done

echo "==> [2/3] MongoDB"
for db in "${MONGO_DBS[@]}"; do
  echo "    - $db"
  docker exec "$MONGO_CT" sh -c \
    "mongodump -u $MONGO_USER -p '$MONGO_PASSWORD' --authenticationDatabase admin --db '$db' --archive --gzip" \
    > "$DEST/mongodb/$db.archive.gz" 2>/dev/null
done

echo "==> [3/3] MinIO"
docker exec "$MINIO_CT" sh -c "mc alias set local http://localhost:9000 $MINIO_USER $MINIO_PASSWORD >/dev/null 2>&1"
for b in "${MINIO_BUCKETS[@]}"; do
  echo "    - $b"
  docker exec "$MINIO_CT" sh -c "rm -rf /tmp/bkp/$b && mc mirror --overwrite --quiet local/$b /tmp/bkp/$b >/dev/null 2>&1 || true"
done
docker cp "$MINIO_CT":/tmp/bkp/. "$DEST/minio/" >/dev/null 2>&1 || true
docker exec "$MINIO_CT" sh -c "rm -rf /tmp/bkp" >/dev/null 2>&1 || true

# --- README + đóng gói ---
cat > "$DEST/README.txt" <<TXT
BACKUP law-app — $TS
MySQL:   ${MYSQL_DBS[*]}   (mysqldump utf8mb4, single-transaction, routines+triggers)
MongoDB: ${MONGO_DBS[*]}   (mongodump --archive --gzip)
MinIO:   ${MINIO_BUCKETS[*]} (mc mirror)
Restore: bash restore.sh (chạy trong thư mục backup này).
TXT

# Copy restore.sh vào bản backup để tự chứa (chạy được độc lập).
cp "$ROOT/scripts/restore.sh" "$DEST/restore.sh" 2>/dev/null || true

echo "==> Dọn backup cũ (giữ $KEEP bản mới nhất)"
ls -1dt "$ROOT"/backups/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "==> HOÀN TẤT: $DEST"
du -sh "$DEST" 2>/dev/null || true

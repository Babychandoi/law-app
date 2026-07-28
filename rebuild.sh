#!/usr/bin/env bash
# Build + deploy 1 hoặc nhiều service rồi TỰ ĐỘNG dọn build cache (tránh phình WSL2/disk).
#
# Dùng:
#   ./rebuild.sh frontend                 # build + up 1 service
#   ./rebuild.sh backend chat-service     # nhiều service
#   ./rebuild.sh --no-cache frontend      # build sạch (khi đổi .env.production)
#   ./rebuild.sh                          # build + up TẤT CẢ
#
# Sau khi build xong luôn chạy `docker builder prune -f` để cache không tích lại.
set -euo pipefail
cd "$(dirname "$0")"

NOCACHE=""
if [[ "${1:-}" == "--no-cache" ]]; then NOCACHE="--no-cache"; shift; fi

SERVICES=("$@")  # rỗng = tất cả

echo "==> Building ${SERVICES[*]:-(all)} ${NOCACHE}"
docker compose build $NOCACHE "${SERVICES[@]}"

echo "==> Up -d ${SERVICES[*]:-(all)}"
docker compose up -d "${SERVICES[@]}"

echo "==> Dọn build cache"
docker builder prune -f >/dev/null

echo "==> Xong. Dung luong hien tai:"
docker system df | grep -iE "TYPE|build cache"

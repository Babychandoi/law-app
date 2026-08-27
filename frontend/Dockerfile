# LUU Y VE SEO: anh nay KHONG co Chrome, nen buoc postbuild (scripts/prerender.js) se bo qua va
# ba trang /ve-chung-toi, /lien-he, /chinh-sach-bao-mat quay lai phuc vu vo SPA rong cho trinh
# quet. Nginx tu lui ve vo SPA nen khong hong gi, chi la mat phan noi dung cho bot — im lang.
# Muon giu phan do thi build CRA tren may co Chrome roi dong goi bang Dockerfile.prebuilt.

# ==================== BUILD STAGE ====================
FROM node:20-alpine AS build

WORKDIR /app

# Ép Node dùng IPv4 (QUAN TRỌNG cho VPS)
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Cấu hình npm: mirror + retry + timeout
RUN npm config set registry https://registry.npmmirror.com \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

# Copy package files để cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code (includes .env.production -> CRA bakes PROD urls into the bundle).
# No REACT_APP_* build args: the single source of truth is frontend/.env.production,
# so the prod build can never accidentally fall back to localhost.
COPY . .

# Build React (NODE_ENV=production -> CRA reads .env.production).
# Cap V8 heap so the CRA/webpack build GCs instead of OOM-killing the builder on
# low-RAM hosts (Docker Desktop ~4GB) — earlier builds hit "rpc EOF" from OOM.
RUN NODE_OPTIONS="--dns-result-order=ipv4first --max-old-space-size=2048" npm run build

# ==================== PRODUCTION STAGE ====================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

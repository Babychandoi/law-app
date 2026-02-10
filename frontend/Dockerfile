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

# Copy source code
COPY . .

# Build args
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
ARG REACT_APP_CHAT_WS_URL

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_WS_URL=${REACT_APP_WS_URL}
ENV REACT_APP_CHAT_WS_URL=${REACT_APP_CHAT_WS_URL}

# Build React
RUN npm run build

# ==================== PRODUCTION STAGE ====================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

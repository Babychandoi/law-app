# Law App

Monorepo cho website Luật Poip gồm React CRA frontend, Spring Boot backend, MySQL, MongoDB, Redis, MinIO và Nginx.

## Yêu cầu local

- Node.js 20 khuyến nghị cho frontend Docker build; CRA vẫn có thể chạy local với Node 16+.
- npm 9+ để đọc `package-lock.json` lockfile v3.
- Java 21 cho backend. Máy hiện tại đang trỏ `JAVA_HOME` tới Java 8 nên `mvn compile` sẽ lỗi.
- Docker Desktop nếu chạy các service phụ trợ bằng compose.

## Chạy development

1. Tạo file env:

   ```bash
   cp .env.example .env
   ```

2. Chạy DB/cache/storage:

   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. Chạy backend:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

4. Chạy frontend:

   ```bash
   cd frontend
   npm ci --legacy-peer-deps
   npm start
   ```

## Kiểm tra

```bash
cd frontend
npm run build
npm run format:check

cd ../backend
mvn test
mvn spotless:check
```

## Ghi chú triển khai

- Frontend giữ CRA và các URL public hiện tại để tránh ảnh hưởng SEO.
- Backend trả response chuẩn có `code`, `message`, `data`, optional `errors`, optional `meta`.
- MySQL dùng cho dữ liệu nghiệp vụ; MongoDB dùng cho chat realtime.
- Đợt nâng cấp này chấp nhận reset sạch dữ liệu, không migration từ schema cũ.
- Thư mục `certbot` được giữ nguyên theo yêu cầu hiện tại.

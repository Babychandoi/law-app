# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Law App is a monorepo for luatpoip.com: a React CRA frontend, a Spring Boot monolith backend, Spring Cloud Gateway, staff-chat and CRM microservices, plus Dockerized MySQL, MongoDB, Redis, MinIO, RabbitMQ, Nginx, and Cloudflare Tunnel.

The system is currently hybrid:

- Public/admin frontend still calls the monolith directly through `REACT_APP_API_URL` (`api.luatpoip.com` in prod).
- Staff chat, CRM admin, and document-template features use `gatewayClient` through `REACT_APP_GATEWAY_URL` (`gateway.luatpoip.com` in prod).
- Gateway already has routes for monolith endpoints, but the frontend has not fully migrated to single-entry-point gateway traffic. See `docs/MICROSERVICE-MIGRATION.md` before changing frontend base URLs.

## Common commands

### First-time/local setup

```powershell
Copy-Item .env.example .env
```

Run local dependencies only; backend and frontend are expected to run locally for hot reload:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

Stop local dependencies:

```powershell
docker compose -f docker-compose.dev.yml down
```

### Frontend (`frontend/`)

Use Node 20 and npm 9+ when possible. This project uses CRA through CRACO and has peer dependency constraints, so install with the legacy peer flag:

```powershell
cd frontend
npm ci --legacy-peer-deps
npm start
```

Checks:

```powershell
cd frontend
npm run build
npm run lint
npm run format:check
npm test -- --watchAll=false
```

Run one Jest test file:

```powershell
cd frontend
npm test -- --watchAll=false --runTestsByPath src/App.test.tsx
```

Format frontend files:

```powershell
cd frontend
npm run format
```

### Spring services

All Java services target Java 21. The root `README.md` notes that the current machine may still point `JAVA_HOME` at Java 8; Maven commands will fail until Java 21 is active.

Run the monolith:

```powershell
cd backend
mvn spring-boot:run
```

Run gateway or microservices similarly:

```powershell
cd gateway
mvn spring-boot:run

cd chat-service
mvn spring-boot:run

cd crm-service
mvn spring-boot:run

cd document-service
mvn spring-boot:run
```

Run tests for a service:

```powershell
cd backend
mvn test
```

Run a single Java test class/method:

```powershell
mvn -Dtest=ClassName test
mvn -Dtest=ClassName#methodName test
```

Format/check Java code where Spotless is configured (`backend/`, `chat-service/`, `crm-service/`, `document-service/`; not currently `gateway/`):

```powershell
mvn spotless:check
mvn spotless:apply
```

Package a service without tests when you only need a Docker/build artifact:

```powershell
mvn -DskipTests package
```

### Docker/prod-style operations

Build and start the full stack:

```powershell
docker compose up -d --build
```

The repository also has `rebuild.sh` for build+up of one or more services followed by Docker build-cache pruning:

```bash
./rebuild.sh frontend
./rebuild.sh backend chat-service
./rebuild.sh --no-cache frontend
./rebuild.sh
```

Use `--no-cache frontend` when changing production CRA env values such as `frontend/.env.production`, because CRA bakes `REACT_APP_*` values at build time.

## Architecture map

### Frontend

- Entry point: `frontend/src/index.tsx` → `frontend/src/App.tsx` → `frontend/src/app/AppRouter.tsx`.
- Active route table: `frontend/src/app/routes.tsx`. It lazy-loads public pages, admin pages, dynamic service pages (`/:slug`), landing pages (`/lp/:slug`), CRM, and staff team chat.
- Legacy route tables still exist under `frontend/src/routers/`, but `AppRouter` uses `frontend/src/app/routes.tsx`.
- Existing route-level pages mostly live in `frontend/src/page/`; new route-level pages should go in `frontend/src/pages/` per `frontend/src/pages/README.md`.
- New feature modules should go in `frontend/src/features/` per `frontend/src/features/README.md`; this is an incremental migration away from legacy `page` and `component` folders.
- API clients live in `frontend/src/service/`:
  - `axiosClient.ts` uses `REACT_APP_API_URL`, `withCredentials`, and XSRF cookie/header settings for httpOnly-cookie auth against the monolith.
  - `gatewayClient.ts` uses `REACT_APP_GATEWAY_URL` and shares the same refresh flow for gateway-backed features.
  - `service.ts` is public monolith API calls.
  - `admin.ts` is admin monolith API calls and CMS management.
  - `teamChat.ts` calls `/staff-chat/**` via gateway.
  - `crm.ts` calls `/crm/**` via gateway.
  - `documentTemplates.ts` calls `/documents/**` via gateway for the separate `/2025/luatpoip/tai-lieu` document area.
- Production builds strip all `console.*` calls via `frontend/craco.config.js`.
- Tailwind brand tokens are in `frontend/tailwind.config.js`.

### Auth and API response conventions

- Authentication uses httpOnly cookies, not browser storage. Frontend requests must use `withCredentials: true`.
- CSRF uses a double-submit cookie: backend sets `XSRF-TOKEN`; axios echoes `X-XSRF-TOKEN` for unsafe methods.
- On 401, `axiosClient`/`gatewayClient` perform one refresh attempt through `/auth/refresh` and then replay the original request. Do not add redirect logic inside the interceptors; callers/route guards own navigation.
- Backend JSON responses use `ApiResponse<T>` with `code`, optional `message`, `data`, optional `errors`, and optional `meta`.

### Backend monolith (`backend/`)

The monolith is Spring Boot 3.5/Java 21 and owns the main business data and public/admin APIs:

- MySQL/JPA: services, jobs, news, customers/cases, users, notifications, CMS content.
- MongoDB: guest chat persistence.
- Redis: notifications and token revocation/shared state.
- MinIO: image/CV uploads.
- RabbitMQ AMQP: publishes CRM case events (`case.created`, `case.statusChanged`) to topic exchange `law-app.events`.
- WebSockets:
  - `/ws` is STOMP/SockJS guest chat.
  - `/ws/notifications` is native WebSocket for admin notifications.
- Security is configured in `backend/src/main/java/org/law_app/backend/security/SecurityConfig.java`; public GETs include service/news/job content, while admin operations require auth.

Important monolith endpoints include `/auth/**`, `/services/**`, `/service/**`, `/jobs/**`, `/news/**`, `/customer/**`, `/notifications/**`, `/upload`, and `/chat/**`.

### Gateway (`gateway/`)

Gateway is Spring Cloud Gateway WebFlux on port 8081. Routes are configured in `gateway/src/main/resources/application.yml`:

- `/staff-chat/**` rewrites to chat-service `/chat/**`.
- `/ws-staff/**` proxies staff-chat SockJS/WebSocket to chat-service.
- `/crm/**` proxies to CRM service.
- `/documents/**` proxies to document-service.
- `/ws/**` proxies monolith guest chat/notifications.
- Monolith routes are already present for `/auth`, `/services`, `/service`, `/jobs`, `/news`, `/customer`, `/notifications`, `/upload`, and `/chat`.

For SockJS routes, gateway uses HTTP URIs instead of `ws://`; Spring Cloud Gateway upgrades WebSocket transport while still allowing SockJS HTTP handshakes.

### Staff chat microservice (`chat-service/`)

`chat-service` is a Spring Boot microservice for internal staff chat:

- Own MongoDB database (`law-app-staff-chat` by default), deliberately separate from monolith guest chat DB.
- REST API under `/chat/**`, exposed externally through gateway as `/staff-chat/**`.
- STOMP endpoint `/ws-staff` with RabbitMQ STOMP broker relay for fan-out across instances.
- Uses shared JWT signer key for offline auth, httpOnly-cookie bearer resolution, Redis token revocation checks, and MinIO `staff-files` bucket for attachments.
- Gets staff directory data from the monolith via `MONOLITH_INTERNAL_URL`.

### CRM microservice (`crm-service/`)

`crm-service` owns customer-care workflow data in its own MySQL database (`law_app_crm`):

- REST API under `/crm/**` via gateway.
- Consumes durable RabbitMQ queue `crm.cases` bound to exchange `law-app.events` with routing key `case.*`.
- Keeps an idempotent read-replica of monolith cases keyed by case ID. Sync updates replicated case columns but does not overwrite CRM-owned care fields.
- Provides care statuses, actions, results, tags, assignments, follow-up logs, and staff lookup.
- Shares auth behavior with the monolith: JWT signer key, cookie bearer resolver, and Redis revocation checks.

### Document template microservice (`document-service/`)

`document-service` owns Word `.docx` template metadata and generated-document history in its own MongoDB database (`law-app-documents`):

- REST API under `/documents/**` via gateway.
- Stores template/generated `.docx` binaries in private MinIO buckets (`document-templates`, `generated-documents`); downloads stream through authenticated service endpoints, not public MinIO URLs.
- Uses `docx4j` to detect `${key}` placeholders and replace text inside existing Word runs so placeholder font/size/style formatting is preserved.
- Frontend route area is `/2025/luatpoip/tai-lieu`, separate from `/2025/luatpoip/admin`.
- Shares auth behavior with the monolith: JWT signer key, cookie bearer resolver, and Redis revocation checks.

## Data and environment notes

- `docker-compose.dev.yml` runs only dependencies: MySQL, MongoDB, Redis, MinIO, and MinIO setup. It does not start RabbitMQ, gateway, chat-service, or CRM; use the full compose file when those are needed end-to-end.
- Full `docker-compose.yml` starts Nginx, frontend, backend, gateway, chat-service, crm-service, document-service, RabbitMQ, MySQL, MongoDB, Redis, MinIO, MinIO setup, and Cloudflare Tunnel.
- `frontend/.env.production` is the production source of truth for CRA build-time URLs; Docker build args do not override these values.
- `AUTH_COOKIE_DOMAIN` must be empty for local HTTP development, and `AUTH_COOKIE_SECURE=false` locally. In production it is set for `luatpoip.com` and secure cookies.
- CRM service must override shared `SPRING_DATASOURCE_*` values to point at `law_app_crm`; otherwise it can accidentally use the monolith DB.
- Chat service must use `CHAT_MONGODB_*` / `CHAT_MONGODB_DATABASE` to stay isolated from the monolith MongoDB database.
- Public GET API caching depends on not emitting `Set-Cookie`; be careful when touching public endpoints or global filters.

## Product/design context

`PRODUCT.md` describes the site goal: explain Vietnamese IP/legal services clearly, build trust, and convert qualified visitors to consultation leads. The tone should be authoritative, clear, and approachable. Avoid flashy visuals or excessive animation that distract from legal content. The frontend should maintain WCAG 2.1 AA expectations and plain Vietnamese copy.

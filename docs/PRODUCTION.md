# Production Deployment Guide

## Prerequisites

- Node.js 18+
- MySQL 8
- Redis 7 (required when `REDIS_ENABLED=true`)
- Docker and Docker Compose (optional)

## Environment

Copy [`.env.example`](../.env.example) to `.env` and set:

| Variable | Production |
|----------|------------|
| `NODE_ENV` | `production` |
| `SWAGGER_ENABLED` | `false` |
| `REDIS_ENABLED` | `true` |
| `REDIS_URL` | Redis cluster URL |
| `JWT_*_SECRET` | Strong random strings (32+ chars); rotate periodically |
| `DB_SSL` | `true` when provider requires TLS |
| `CORS_ORIGIN` | Your frontend origin |

## Docker Compose

```bash
docker compose up -d --build
```

The entrypoint runs migrations before starting the app ([`scripts/docker-entrypoint.sh`](../scripts/docker-entrypoint.sh)).

## Startup order (manual deploy)

1. `npm ci`
2. `npm run build`
3. `npm run migration:run:prod` (or `migration:run` in dev)
4. `npm run seed` (first deploy only, or when resetting RBAC)
5. `npm run start:prod`

## Health probes

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health/live` | Process alive |
| `GET /api/v1/health/ready` | Database (+ Redis when enabled) |

Use `/ready` for load balancer and Kubernetes readiness checks.

## Scaling

- Run multiple app instances behind a load balancer.
- Keep `REDIS_ENABLED=true` so token blacklist and permission cache are shared.
- Do not use `REDIS_ENABLED=false` outside single-process local dev.

## Observability

OpenTelemetry is prepared in [`src/infrastructure/observability/tracing.ts`](../src/infrastructure/observability/tracing.ts).

Set `OTEL_ENABLED=true` and extend `initTracing()` with your SDK exporter when connecting to a collector. Full SDK packages are not bundled in this template to keep dependencies minimal.

## Verification

Before promoting a release:

```bash
npm ci && npm run lint && npm run migration:run && npm test -- --coverage && npm run test:e2e && npm run build
```

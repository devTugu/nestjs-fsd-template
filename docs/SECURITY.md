# Security

## Authentication

- **Access tokens**: JWT, short-lived (`JWT_ACCESS_EXPIRES_IN`, default 15m).
- **Refresh tokens**: JWT stored as SHA-256 hash in MySQL; rotation on each refresh.
- **Logout**: Access token JTI blacklisted (Redis or in-memory); refresh token revoked.

## Authorization (RBAC)

- Permissions are checked via `@Permissions()` and `PermissionsGuard`.
- Permission codes are seeded in [`permissions.const.ts`](../src/infrastructure/database/seed/permissions.const.ts).
- Cached per user in Redis (or in-memory when `REDIS_ENABLED=false`).

## Rate limiting

- Global throttle: `THROTTLE_TTL` / `THROTTLE_LIMIT`.
- Login: 5 requests per minute per IP (`@Throttle` on login endpoint).
- Refresh: 10 requests per minute.

## HTTP hardening

- Helmet security headers
- CORS restricted to `CORS_ORIGIN`
- Validation pipe: whitelist + forbid unknown properties
- Trust proxy enabled for correct client IP behind reverse proxy

## Secrets

- Never commit `.env`
- JWT secrets minimum 32 characters (enforced at startup)
- Use different secrets per environment

## Audit

Mutating API calls and login/logout are recorded in `audit_logs`. See [ADR 003](adr/003-audit-logging.md).

Audit failures do not block requests.

## Production checklist

- [ ] `SWAGGER_ENABLED=false`
- [ ] `REDIS_ENABLED=true`
- [ ] Strong unique JWT secrets
- [ ] TLS termination at reverse proxy
- [ ] Database credentials least privilege
- [ ] Regular dependency audits (`npm audit`)

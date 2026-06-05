# ADR 003: Audit Logging

## Status

Accepted

## Context

Regulated and production APIs need a trace of who changed what. The `audit_logs` table exists; writes must not break primary requests.

## Decision

- Application port `IAuditLogRepository` and `RecordAuditLogUseCase` (swallows errors, logs warnings).
- Global `AuditInterceptor` on mutating HTTP methods for `users`, `roles`, `permissions`, plus `auth/login` and `auth/logout`.
- Fields: `userId`, `action`, `resource`, `resourceId`, `ipAddress`, `metadata` (path/method only; no passwords).

## Consequences

- Login audits may have `userId` null until JWT is issued.
- Retention and PII policies are operator-owned (not automated purge in this template).

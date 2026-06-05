# ADR 004: Redis and Permission Cache

## Status

Accepted

## Context

Token blacklist and permission cache require shared state in multi-instance production. Local XAMPP developers may not run Redis.

## Decision

- `REDIS_ENABLED=true` (default): `REDIS_URL` required; Redis adapters for blacklist and permission cache; readiness checks Redis.
- `REDIS_ENABLED=false`: in-memory adapters (single process only); readiness skips Redis.

## Consequences

- Never use `REDIS_ENABLED=false` in production clusters (logout/blacklist not shared across instances).
- Docker Compose and CI keep `REDIS_ENABLED=true`.

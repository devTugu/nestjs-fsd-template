# ADR 002: URI API Versioning

## Status

Accepted

## Context

Clients need stable contracts; internal architecture may change without breaking consumers.

## Decision

- Global prefix: `/api`
- URI versioning with default version `1`
- All public routes: `/api/v1/...`
- Legacy unversioned routes are not supported after migration

## Consequences

- Swagger and README document `/api/v1` base paths
- Controllers use `@Controller({ path: 'auth', version: '1' })`

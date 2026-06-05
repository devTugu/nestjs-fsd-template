# ADR 001: Clean Architecture Layers

## Status

Accepted

## Context

The API requires maintainable boundaries, testable business logic, and infrastructure swapability (MySQL, Redis, JWT).

## Decision

Adopt four layers with dependency rule pointing inward:

- `domain` — entities, repository interfaces, domain services (no Nest/TypeORM)
- `application` — use cases, ports, application DTOs
- `infrastructure` — TypeORM, Redis, JWT adapters, mappers
- `presentation` — HTTP controllers, guards, filters (Nest-specific)

## Consequences

- More files and boilerplate; offset by testability and clear ownership
- Nest modules live in `presentation/http/modules` as composition root per bounded context
- Legacy folders (`src/modules`, `src/common`, etc.) were removed; use the layered tree only

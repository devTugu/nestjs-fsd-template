# Contributing

## Architecture

Follow Clean Architecture layers:

```
presentation → application → domain ← infrastructure
```

See [ADR 001](adr/001-clean-architecture.md).

## Adding a feature

1. **Domain** — entity, repository interface in `src/domain/<context>/`
2. **Application** — use case + DTO in `src/application/<context>/use-cases/`
3. **Infrastructure** — TypeORM entity, mapper, repository in `src/infrastructure/`
4. **Presentation** — v1 controller, Swagger DTO, module registration
5. **Tests** — unit spec next to use case; e2e for critical HTTP paths
6. **Migration** — if schema changes: `npm run migration:generate --name=YourChange`

## Code style

- TypeScript strict; avoid `any`
- English for public API messages, Swagger, and docs
- Conventional commits for git history

## Running locally

```bash
npm install
cp .env.example .env
# For XAMPP without Redis: REDIS_ENABLED=false
npm run migration:run
npm run seed
npm run start:dev
```

## Tests

```bash
npm test
npm run test:cov
npm run test:e2e   # requires MySQL + migrations + seed
```

Default admin after seed: `admin@example.com` / `Admin123!`

---
title: "I Built a Full-Stack RBAC Admin Starter with NestJS Clean Architecture and Next.js FSD"
published: false
description: "Open-source MIT templates for a production-oriented admin console: NestJS API with JWT + RBAC on the backend, Next.js 16 dashboard with Feature-Sliced Design on the frontend."
tags: nextjs, nestjs, rbac, typescript, webdev, opensource, tutorial
cover_image: https://raw.githubusercontent.com/devTugu/nextjs-fsd-template/main/docs/gallery/dashboard-overview.png
canonical_url: https://dev.to/YOUR_USERNAME/full-stack-rbac-starter-nestjs-nextjs
---

Most admin dashboards I see online are either **UI-only demos** (no real auth) or **backend-only APIs** (no usable console). I wanted a pair of templates I could actually ship on client work — so I built two MIT repos that work together out of the box.

## What you get

| Repo | Role | Stack highlights |
|------|------|------------------|
| [nestjs-fsd-template](https://github.com/devTugu/nestjs-fsd-template) | REST API | Clean Architecture, JWT + refresh, RBAC, MySQL, Redis, Swagger |
| [nextjs-fsd-template](https://github.com/devTugu/nextjs-fsd-template) | Admin UI | Next.js 16, Feature-Sliced Design, TanStack Query/Table, shadcn/ui |

Together they give you:

- Login / logout / token refresh
- Users, roles, and permissions CRUD
- Role assign & unassign per user
- Permission-gated UI (`SUPER_ADMIN` or granular codes)
- Sheet-based admin UX (not nested dialog hell)
- CI, docs, ADRs, and production checklists

**Default seed admin:** `admin@example.com` / `Admin123!`

## Architecture at a glance

### Backend — Clean Architecture

```
presentation → application → domain ← infrastructure
```

- **Domain:** pure business rules, repository interfaces
- **Application:** use cases (create user, assign role, …)
- **Infrastructure:** TypeORM, Redis blacklist, JWT adapters
- **Presentation:** versioned controllers at `/api/v1/*`

~98% test coverage on application + domain layers. Migrations + seed included.

### Frontend — Feature-Sliced Design

```
app → widgets → features → entities → shared
```

- **Entities:** API hooks, Zod schemas, table columns
- **Features:** auth, users, roles, permissions screens
- **Widgets:** `AdminFormSheet`, `PermissionPicker`, `DataTable`
- **Shared:** Axios client with Nest envelope unwrap + JWT refresh on 401

## UX decision I care about

Early versions used `⋮` dropdown → dialog for every action. Assigning a role took too many clicks and felt brittle.

**v0.1.0** consolidates flows into **right-side sheets**:

- **Users:** Profile tab + Roles tab in one sheet (edit, assign, unassign)
- **Roles:** grouped permission picker with search and select-all
- **Tables:** pencil / trash icons instead of hidden menus

Small change, big difference for daily admin use.

## Quick start (local)

**Terminal 1 — API (port 3001)**

```bash
git clone https://github.com/devTugu/nestjs-fsd-template.git
cd nestjs-fsd-template
cp .env.example .env
npm install
npm run migration:run
npm run seed
APP_PORT=3001 npm run start:dev
```

**Terminal 2 — Frontend (port 3000)**

```bash
git clone https://github.com/devTugu/nextjs-fsd-template.git
cd nextjs-fsd-template
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with the seed admin.

## API ↔ UI contract

The frontend expects the Nest API envelope and these highlights:

- `POST /api/v1/auth/login` → access + refresh tokens
- `GET /api/v1/auth/me` → `roles[]` + `permissionCodes[]`
- Full CRUD on users, roles, permissions
- `POST /roles/assign` and `DELETE /roles/assign/:userId/:roleId`

CORS on the API must match your frontend origin exactly (`http://localhost:3000` in dev).

## Who is this for?

- Freelancers / agencies starting RBAC admin projects
- Teams wanting **opinionated structure** (not another todo demo)
- Devs learning Clean Architecture + FSD in a real-ish codebase

## What's not included (yet)

- Hosted live demo (deploy frontend to Vercel + API separately — docs included)
- Full CI E2E with dockerized API in GitHub Actions (stub job today)
- i18n / multi-tenant

## Releases

Both repos ship **v0.1.0** as the first stable template release:

- [nestjs-fsd-template releases](https://github.com/devTugu/nestjs-fsd-template/releases)
- [nextjs-fsd-template releases](https://github.com/devTugu/nextjs-fsd-template/releases)

## Links

- **Backend:** https://github.com/devTugu/nestjs-fsd-template
- **Frontend:** https://github.com/devTugu/nextjs-fsd-template
- **License:** MIT on both

If this saves you a week on your next admin project, a ⭐ on either repo helps others find it.

---

*Questions or feedback? Open an issue on GitHub — I read them.*

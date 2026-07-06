# House of EduTech — Local-First Collaborative Document Editor

A local-first, real-time collaborative document editor built with Next.js 16, PostgreSQL, and IndexedDB. Documents are edited locally first (via Dexie/IndexedDB) so typing is never blocked by the network, then synced to the server and shared with collaborators under role-based permissions.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL via Sequelize ORM |
| Auth | Auth.js v5 (Credentials provider, JWT sessions) |
| Local-first storage | IndexedDB via Dexie + dexie-react-hooks |
| Rich text editor | Tiptap v3 |
| Validation | Zod |
| Forms | React Hook Form + `@hookform/resolvers` |
| Real-time collaboration | Socket.IO (separate server — not built yet, see Roadmap) |

---

## Getting started

### Prerequisites

- Node.js 22+
- A running PostgreSQL instance

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run db:migrate
npm run db:seed        # creates a demo Owner account
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Validated at startup by `src/config/env.ts` (Zod) — the app refuses to boot with a missing/invalid value instead of failing obscurely mid-request.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `AUTH_SECRET` | Auth.js JWT signing secret — generate with `npx auth secret` |
| `NEXTAUTH_URL` | Base URL Auth.js uses for callbacks (optional in dev) |
| `SOCKET_SERVER_URL` | URL of the standalone Socket.IO server (not built yet) |

### Demo account

The seeder (`src/database/seeders/20260703120100-demo-owner.js`) creates:

- **Email:** `owner@example.com`
- **Password:** `password123`
- **Role:** `owner`

### Useful scripts

```bash
npm run dev              # start the dev server
npm run build             # production build
npm run lint               # eslint
npm run db:migrate        # apply pending migrations
npm run db:migrate:undo   # roll back the last migration
npm run db:seed           # run seeders
npm run db:seed:undo      # undo seeders
```

---

## Architecture

MVC-style layering on the backend, feature-first organization on the frontend.

```
Route handler (src/app/api/**)
      ↓
Controller (src/controllers/*.controller.ts)   — parses request, calls service, formats response
      ↓
Service (src/services/*.service.ts)            — business logic, permission checks
      ↓
Repository (src/repositories/*.repository.ts)  — the only layer that touches Sequelize models
      ↓
Model (src/models/*.ts)                        — Sequelize model definitions, no business logic
      ↓
PostgreSQL
```

Every API response follows the same shape (`src/utils/api-response.ts`):

```json
{ "success": true, "message": "...", "data": { ... }, "errors": null }
```

Errors are centralized in `src/lib/errors.ts` — an `AppError(statusCode, message)` thrown anywhere in a service is caught by `handleApiError()` in the controller and turned into the response above. Unexpected errors are logged server-side and returned as a generic 500 — no stack traces ever reach the client.

### Folder structure

```
src/
  app/
    (app)/                 route group for authenticated pages — shares one layout with the sidebar
      layout.tsx           fetches session + document list once, renders <Sidebar>, redirects to /login if signed out
      dashboard/            document list (cards)
      documents/[id]/       document editor page
      users/                 owner-only user management page
    login/, signup/         public auth pages
    api/                    route handlers (thin — delegate straight to controllers)
    layout.tsx, page.tsx     root layout + public landing page
    providers.tsx            SessionProvider wrapper
  components/
    ui/                      generic reusable primitives (Button, Input)
    layout/                  app chrome (Sidebar)
  features/
    auth/components/         login/signup forms, sign-out button
    document/
      components/            document list/detail/editor/toolbar/collaborator panel
      hooks/                  use-local-document (Dexie binding)
    users/components/        user management table + create-user form
  controllers/, services/, repositories/, models/     backend MVC layers (see above)
  validators/                Zod schemas, one file per domain (auth, document, user)
  types/                     shared TypeScript types (not derivable from Zod alone)
  lib/
    auth/                    Auth.js config (auth.ts) + requireSession() helper
    db/                      sequelize.ts (pooled connection) and dexie.ts (IndexedDB schema)
    errors.ts, password.ts
  middleware/
    require-role.ts          global-role guard used by controllers (session.user.role)
  constants/roles.ts         Role enum shared by Zod schemas, Sequelize ENUMs, and UI
  config/                    env.ts (validated environment), database.js (CLI-only, CommonJS)
  database/
    migrations/, seeders/    Sequelize CLI migrations/seeders (plain CommonJS — see note below)
  proxy.ts                   Next.js 16's middleware entry point (renamed from middleware.ts)
```

**Why `proxy.ts` and not `middleware.ts`?** Next.js 16 renamed the middleware file convention to `proxy` and it now runs on the **Node.js runtime by default** (previously Edge) — this is why `auth.ts` can safely import `bcryptjs` and Sequelize without any edge-bundling workaround.

**Why are migrations/seeders plain `.js`, not `.ts`?** `sequelize-cli` cannot load TypeScript. `src/config/database.js` (CommonJS) is the CLI-facing config; the app's actual runtime connection is the separate, typed `src/lib/db/sequelize.ts`.

**Why do repositories import models from `src/models` (the index), never from the individual model file?** `src/models/index.ts` is where every model's `associate()` runs, wiring up `belongsTo`/`hasMany`. Importing `@/models/document` directly skips that wiring, and any query using Sequelize's `include` fails at runtime with `X is not associated to Y` — this bit us once during development; see the folder's own comment for the long version.

### Database schema

| Table | Purpose |
|---|---|
| `users` | Account + global `role` (see Roles below) |
| `documents` | `title`, `content` (JSONB — the Tiptap/ProseMirror document tree), `owner_id` |
| `collaborators` | Join table: `(document_id, user_id, role)` — **the single source of truth for what a user can do on a specific document**, including the owner |
| `versions` | Immutable content snapshots for version history (feature not built yet — see Roadmap) |

Cascades: deleting a document removes its collaborators and versions. Deleting a user removes documents they own; their authored versions survive with `created_by_id` set to `NULL`.

### Local-first editing

- `src/lib/db/dexie.ts` defines a `documents` table in IndexedDB (`id`, `title`, `content`, `role`, `updatedAt`).
- Opening a document hydrates Dexie from the server payload once (server wins unless the local copy is already newer).
- The Tiptap editor renders from a live Dexie query (`dexie-react-hooks`) — typing writes to IndexedDB on a ~400ms debounce and never touches the network.
- **Current limitation:** local edits do not yet reach the server or other collaborators — that's the "Offline sync" milestone below. Content and title changes persist across a reload on the same device/browser only.

---

## Roles and permissions

There are **two separate role systems** — don't conflate them:

### 1. Global account role (`User.role`)

Set at signup (defaults to `editor`) or by an Owner via **Manage Users** (`/users`, owner-only). Currently gates exactly one thing: access to the Manage Users screen and its API (`requireRole` in `src/middleware/require-role.ts`, checked against the Auth.js session).

| Role | Can do |
|---|---|
| `owner` | Everything a non-owner can, **plus**: view `/users`, create new user accounts, change any other user's global role (not their own) |
| `editor` | Sign in, create their own documents, everything document-permission-based below |
| `viewer` | Same as editor today — this role exists for future use; nothing currently restricts a `viewer` account differently at the global level |

### 2. Document-level role (`Collaborator.role`)

This is what actually governs what you can do **on a specific document** — set per `(document, user)` pair in the `collaborators` table. Every document access check goes through `assertDocumentAccess()` in `src/services/collaborator.service.ts`:

| Role | View | Edit content | Delete document | Manage collaborators |
|---|---|---|---|---|
| `owner` | ✅ | ✅ | ✅ | ✅ (invite/remove/change others' role; can't be changed or removed themselves) |
| `editor` | ✅ | ✅ | ❌ | ❌ |
| `viewer` | ✅ | ❌ (read-only editor) | ❌ | ❌ |

- Creating a document atomically creates the `Document` row **and** an `owner` `Collaborator` row in one transaction — a document can never exist without an accessible owner.
- A user with no `Collaborator` row for a document gets `404` (not `403`) — this avoids revealing whether a document exists to someone with no access.
- The sidebar splits documents into **Documents** (you're the owner) and **Collaborators** (someone shared it with you as editor/viewer).

---

## Development guide

### Adding a new API endpoint

1. Zod schema in `src/validators/<domain>.validator.ts`.
2. Repository method in `src/repositories/<domain>.repository.ts` (only place that imports a Sequelize model — from `@/models`, not the individual file).
3. Service method in `src/services/<domain>.service.ts` — business logic and permission checks (`AppError` for anything that should surface to the client).
4. Controller function in `src/controllers/<domain>.controller.ts` — parse request → call service → `successResponse()`; wrap in `try/catch` → `handleApiError()`.
5. Thin route file under `src/app/api/**/route.ts` that just re-exports the controller functions as `GET`/`POST`/etc.

### Adding a new Sequelize model

1. Define it in `src/models/<name>.ts` using `InferAttributes`/`InferCreationAttributes` (see `src/models/document.ts` for the pattern) with a `static associate()`.
2. Register it in `src/models/index.ts` — add to the `models` object **and** re-export it. Repositories must import from `@/models`, never `@/models/<name>` directly (see the architecture note above on why).
3. Write the migration by hand in `src/database/migrations/` (CommonJS, `sequelize-cli` conventions) — there's no model-to-migration generator wired up.

### Testing changes

There's no automated test suite yet. The working pattern used throughout this project's history: run `npx tsc --noEmit`, `npm run lint`, and `npm run build` after every change, then actually drive the feature in a real browser (a Playwright script against the dev server) rather than trusting that a clean build means the feature works — several real bugs (a stale Sequelize association wiring issue, a Dexie/Tiptap focus race) were only caught this way, not by the type checker.

### Code style

- No unnecessary abstractions — a repeated three-liner beats a premature helper.
- Comments explain *why*, not *what* — the code should read clearly enough that a "what" comment would be redundant.
- Never trust client-provided roles/permissions — every authorization check re-derives the caller's role from the session/DB server-side.

---

## Roadmap

### Completed

- [x] Project setup — Next.js 16, Sequelize, PostgreSQL, Tailwind, Auth.js, Dexie, Zod, folder structure
- [x] Authentication backend — User model/migration/seeder, signup API, Auth.js Credentials + JWT sessions, role-guard middleware
- [x] Auth UI — login/signup pages (React Hook Form + Zod)
- [x] Database — Document, Collaborator, Version models + migrations
- [x] Document API + dashboard UI — CRUD, collaborator invite/role-change/remove, permission checks
- [x] Editor — Tiptap + Dexie local-first editing (content/title persist locally; server sync not yet built)
- [x] App shell — sidebar/navbar with user profile, Documents/Collaborators sections, active-document highlighting
- [x] Document cards on the dashboard
- [x] User management — Owner-only screen to create users and change global roles; signup no longer auto-grants Owner
- [x] Sidebar quick-invite for the currently open document
- [x] Light-only theme (no dark-mode switching)

### Pending

- [ ] **Offline sync** — Dexie `syncQueue` table for pending local mutations, background service that flushes to the server when online, retry/backoff, basic conflict handling. *(This is what closes the gap where local edits don't yet reach the server or other collaborators.)*
- [ ] **Socket.IO** — standalone Node.js server (independent of Next.js), room-based real-time collaboration, `useSocket()` / `useCollaboration()` hooks
- [ ] **Version history** — snapshot on save/checkpoint, restore-as-new-version (never deletes history), UI to browse and restore past versions
- [ ] **AI features** — document summarization and text-improvement actions using the Vercel AI SDK (`ai` + `@ai-sdk/google`) and Gemini — requires a Gemini API key

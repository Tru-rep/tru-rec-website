# Sudan Digital Record System

A private, secure, installable **Progressive Web App (PWA)** for an organization to
digitize person records — replacing paper notebooks. Owner (admin) and staff log in
to a shared Supabase database. Mobile-first, Arabic **RTL**, dark-mode ready.

> This is a self-contained project. It does **not** share code, dependencies, or
> configuration with any sibling folders.

---

## Tech stack

- **React + Vite + TypeScript**
- **Tailwind CSS** (dark mode via `class`)
- **React Router** (protected + admin-only routes)
- **React Hook Form + Zod** (validation)
- **TanStack Query** (server state / caching)
- **Supabase** (Postgres, Auth, Storage)
- **vite-plugin-pwa** (installable, offline page, icons)
- Target deploy: **Vercel**

---

## Architecture (layering)

```
UI components ──▶ hooks (TanStack Query) ──▶ services ──▶ lib (supabase client)
   (dumb)            (cache + state)         (business)     (transport)
```

- **`lib/`** — transport + config: the Supabase client, env validation, zod schemas.
- **`services/`** — the ONLY place that talks to Supabase tables/auth/storage.
  Business rules (which columns to select, pagination, search, upload paths) live
  here, never in components.
- **`hooks/`** — TanStack Query wrappers around services (caching, invalidation,
  mutations). UI calls hooks, not services directly.
- **`context/`** — cross-cutting app state (auth/session, theme, toasts).
- **`components/`** — small, single-responsibility, presentational pieces
  (`ui/`, `common/`, `layout/`, `cards/`, `forms/`).
- **`pages/`** — route screens that compose hooks + components.
- **`routes/`** — router config + route guards.
- **`utils/` / `types/`** — pure helpers and shared types.

**Why this scales** — because Supabase is hidden behind `services/` and consumed
through `hooks/`, future features slot in without rewrites:

- **OCR** → add `services/ocrService.ts`; the Add Record form calls a hook that
  pre-fills fields. No UI/business mixing.
- **PDF / Excel export** → `services/exportService.ts` + a button; reuses existing
  record queries.
- **Audit logs** → new `audit` table + DB triggers + `services/auditService.ts`;
  RLS already centralizes permissions.
- **Multi-org** → add `org_id` to tables and RLS predicates; services gain an org
  filter; UI is largely unchanged.
- **Native apps** → the services/hooks layer is UI-agnostic and can back a React
  Native client against the same Supabase backend.

---

## Folder structure

```
sudan-record-system/
  src/
    assets/
    components/{common,layout,forms,cards,ui}/
    pages/{Login,Dashboard,Search,AddRecord,RecordDetails,EditRecord,Users,Settings,NotFound}/
    hooks/ services/ lib/ context/ utils/ types/ routes/ styles/
    App.tsx main.tsx
  supabase/migrations/   # SQL: schema, RLS, storage
  scripts/               # icon generator (no native deps)
  public/                # PWA icons, offline page, favicon
  index.html vite.config.ts tailwind.config.js tsconfig*.json
  package.json .env.example .gitignore README.md
```

---

## Roles & permissions

| Capability                | Admin | Staff |
| ------------------------- | :---: | :---: |
| Login                     |  ✅   |  ✅   |
| Add / edit / search / view records | ✅ | ✅ |
| Delete records            |  ✅   |  ✅   |
| Manage users & roles      |  ✅   |  ❌   |
| Manage settings           |  ✅   |  ✅ (own) |

Enforced **twice**: in the UI (route guards + conditional controls) and at the
**database** via Supabase Row Level Security (see `supabase/migrations/0002_rls.sql`).

---

## Getting started (Windows PowerShell)

### Step 1 — Configure environment

```powershell
cd c:\Users\Awab\OneDrive\Desktop\tru-rec-website\sudan-record-system
Copy-Item .env.example .env
notepad .env   # paste your Supabase URL + anon key
```

`.env` values come from **Supabase Dashboard → Project Settings → API**:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_PHOTO_BUCKET=record-photos
```

### Step 2 — Install & run

```powershell
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). Without a configured
Supabase, the login screen still renders with a "configure Supabase" banner.

### Build / preview

```powershell
npm run build      # tsc type-check + vite build
npm run preview    # serve the production build
```

---

## Supabase setup

1. **Create a project** at https://supabase.com.
2. **Run migrations** — open the SQL editor and run, in order:
   - `supabase/migrations/0001_init.sql` (schema, indexes, triggers)
   - `supabase/migrations/0002_rls.sql` (row level security)
   - `supabase/migrations/0003_storage.sql` (private photo bucket + storage RLS)
   - `supabase/migrations/0004_security_hardening.sql` (role guard, `created_by`, private bucket)
   - `supabase/migrations/0005_report_number.sql` (رقم البلاغ field)
   - `supabase/migrations/0006_staff_can_delete_records.sql` (staff can delete records + photos)

   (Or with the CLI: `supabase db push`.)
3. **Storage bucket** — `0003` creates the private `record-photos` bucket. Photos are
   shown via **signed URLs** (authenticated users only).
4. **Disable public sign-up** (required for production):
   - **Authentication → Providers → Email** → turn **off** “Enable sign up”
   - Only create users via **Authentication → Users → Add user** (enable **Auto Confirm User**)
5. **Redirect URLs** — **Authentication → URL Configuration** → add:
   - `http://localhost:5173/reset-password` (dev)
   - `https://your-domain/reset-password` (production)
6. **Create the first admin user**
   - Auth → Users → "Add user" (set email + password, **Auto Confirm User**)
   - The DB trigger makes the **first** user an `admin` automatically. Promote others
     from the app **Users** page after they exist in Supabase.

> **Creating users:** the browser app cannot safely create auth users with passwords
> (requires **service_role**). Add users in the Supabase Dashboard, or deploy an Edge
> Function with the admin API later.

---

## PWA

- Installable (Add to Home Screen) with name, icons, theme/splash color.
- Offline navigation falls back to `public/offline.html`.
- Record photos use **signed URLs** (private bucket); limited offline cache in production.
- Icons are generated by `scripts/generate-icons.mjs` (pure Node, no native deps);
  re-run `node scripts/generate-icons.mjs` to regenerate.

The service worker is **disabled in dev** (`devOptions.enabled: false`) and active in
production builds.

---

## Performance

- Route pages are **lazy-loaded** (code-split per route).
- Images are **compressed client-side** before upload (`browser-image-compression`).
- Record lists are **paginated**; list/search queries select only summary columns.
- Search is backed by **pg_trgm** GIN indexes for fast partial matching.

---

## Deploy to Vercel

1. Import the repo **`Tru-rep/tru-rec-website`** on Vercel.
2. **Either** leave **Root Directory** empty (repo root `vercel.json` builds `sudan-record-system` automatically) **or** set Root Directory to `sudan-record-system` and use the defaults there.
3. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
4. Add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SUPABASE_PHOTO_BUCKET` in Project Settings.
5. SPA rewrites are in `vercel.json` (repo root and `sudan-record-system/`).

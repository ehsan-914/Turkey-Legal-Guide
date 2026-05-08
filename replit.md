# Türkiye Danışmanlık — سایت مشاوره ترکیه

A professional consulting platform for Iranian clients seeking educational consulting, residency, and legal services in Turkey. Features a Persian-language public website and a full English admin management panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/turkiye-consulting run dev` — run the frontend (port 23059)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Secret for express-session

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5 + express-session (cookie-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Charts: Recharts

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas
- `lib/db/src/schema/` — Database schema (consultations, cases, messages, services, users)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/turkiye-consulting/src/pages/` — Frontend pages

## Architecture decisions

- Session-based auth using express-session with SHA-256 password hashing (no external auth needed for a single-admin scenario)
- Orval codegen in `mode: "single"` for Zod to avoid duplicate exports from split mode
- Public site in Farsi, admin panel in English for operator-friendly workflow
- Services, consultations, and cases are all separate entities — consultations become cases when approved

## Product

- **Public website (Farsi):** Landing page showcasing services, a dedicated services listing page with category filters, and a contact/consultation request form
- **Admin panel:** Full dashboard with stats, recent activity, and charts. Manage consultation requests, create and track cases, send messages, and manage service offerings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Zod output must use `mode: "single"` in `orval.config.ts` to avoid duplicate export errors
- Session cookies require `sameSite: "none"` in production for cross-origin proxy

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

---
name: testing-turkey-legal-guide
description: Test the Turkey Legal Guide (Turkiye Consulting) application end-to-end. Use when verifying frontend UI, API routes, auth, or form submissions.
---

# Testing Turkey Legal Guide

## Prerequisites

### Database Setup
1. Install and start PostgreSQL
2. Create a local dev user and database for the app
3. Push schema: `DATABASE_URL=<your-db-url> pnpm --filter @workspace/db run push`
4. Seed admin user with a SHA-256 hash of the default password

### Devin Secrets Needed
- No external secrets required. Local PostgreSQL credentials are sufficient.

## Starting the Application

### API Server (port 8080)
```bash
# Build first
pnpm --filter @workspace/api-server run build

# Run with required env vars: DATABASE_URL, PORT, SESSION_SECRET, ALLOWED_ORIGINS
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

### Frontend Dev Server (port 23059)
The frontend uses relative `/api/...` URLs. In dev mode, you MUST add a Vite proxy to forward API requests:

Temporarily add to `vite.config.ts` server section:
```ts
proxy: {
  "/api": {
    target: "http://localhost:8080",
    changeOrigin: true,
  },
},
```

Then start:
```bash
PORT=23059 BASE_PATH="/" pnpm --filter @workspace/turkiye-consulting run dev
```

**Important:** Revert the proxy change after testing.

## Key Test Scenarios

### Public Pages
- Homepage loads with Persian RTL content
- Services page shows services with category filters
- Contact form validates required fields (shows Persian error messages)
- Contact form submits successfully and shows success message
- 404 page shows Persian message

### Admin Panel
- Login with admin credentials redirects to dashboard
- Dashboard shows stats (consultations count, pending, active, completed)
- Consultations page lists submissions with search and status filter
- Services page shows services with edit/delete/toggle controls

### Security
- Unauthenticated requests to `/api/cases`, `/api/consultations`, `/api/stats/*` return 401
- Public endpoints (`GET /api/services`, `POST /api/consultations`) remain open
- CORS blocks requests from unauthorized origins

### Mobile
- At mobile viewport (375px width), public pages show hamburger menu
- Menu opens as a slide-out Sheet with navigation links in Persian
- Use Chrome DevTools device emulation to test

## Known Issues
- Radix UI `DialogContent` accessibility warnings in console (pre-existing, non-blocking)
- The SPA router may redirect `/` to `/admin` when logged in. Navigate to `/services` or `/contact` directly to test public pages while authenticated
- When using Chrome DevTools mobile emulation, navigate via console (`window.location.href = '/services'`) if URL bar navigation doesn't work

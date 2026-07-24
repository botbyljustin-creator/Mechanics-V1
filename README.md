# Mechanics_OS

Internal operating system for the 6 Mechanics business systems (Business
Development, Operations, Finance, People, Technology & Automation,
Leadership). Next.js + SQLite (via Prisma), single deployable app.

## What this is

- **Hub dashboard** — the schematic wheel view of all 6 departments with
  live health indicators, plus the cause-and-effect flow panel.
- **Department view** — KPI gauges and SOPs per department.
- **Accounts** — one login per department (department head), one
  Leadership account, and one Admin account.
- **Permissions** — everyone can view every department read-only.
  A department head can edit their own department's KPIs and SOPs.
  Leadership and Admin can edit every department.
- **Data** — SQLite database (via Prisma) with real tables:
  `Department`, `User`, `Kpi`, `KpiHistory`, `Sop`. Every KPI edit is
  appended to `KpiHistory` (who changed it, old/new values, when) so
  nothing is silently overwritten.

## Running it locally

Requires Node 20+.

```bash
npm install
cp .env.example .env        # then edit .env (see below)
npm run prisma:migrate      # creates prisma/dev.db and applies the schema
npm run prisma:seed         # loads the 6 departments + 7 accounts
npm run dev                 # http://localhost:3000
```

`.env` needs two values:

- `DATABASE_URL` — `file:./dev.db` is fine for local dev.
- `JWT_SECRET` — any long random string. Generate one with
  `openssl rand -base64 48`.
- `SEED_DEFAULT_PASSWORD` — the password every seeded account gets on
  first run (default `ChangeMe123!` if unset).

### Seeded accounts

The seed script prints all accounts and the shared seed password when
it runs. All seeded accounts share that one password until you log in
and change it via the account menu (top right → **Change password**).

| Email | Department | Role |
|---|---|---|
| bizdev@mechanicsos.local | Business Development | Dept Head |
| ops@mechanicsos.local | Operations | Dept Head |
| finance@mechanicsos.local | Finance | Dept Head |
| people@mechanicsos.local | People | Dept Head |
| tech@mechanicsos.local | Technology & Automation | Dept Head |
| leadership@mechanicsos.local | Leadership | Leadership (edits all) |
| admin@mechanicsos.local | — | Admin (edits all) |

**Change every one of these passwords before this app is reachable by
anyone other than you.** There's no forced-reset-on-first-login flow —
that's a manual step for now.

## How it's built

- `prisma/schema.prisma` — the 5 tables (`Department`, `User`, `Kpi`,
  `KpiHistory`, `Sop`) and the `Role` enum (`ADMIN`, `LEADERSHIP`,
  `DEPT_HEAD`).
- `prisma/seed.js` — loads the 6 departments/KPIs/SOPs (carried over
  1:1 from the original prototype and the Mechanics reference doc) and
  creates the 7 accounts.
- `src/lib/auth.js` — password hashing (bcrypt) and session JWTs
  (`jose`), signed and verified with `JWT_SECRET`.
- `src/proxy.js` — Next.js request proxy (formerly called
  "middleware"). Redirects unauthenticated page requests to `/login`
  and 401s unauthenticated API requests.
- `src/lib/permissions.js` — the one function (`canEditDepartment`)
  that every write route checks.
- `src/app/api/**` — REST-ish route handlers for auth, departments,
  KPIs, and SOPs.
- `src/app/page.js` + `src/components/**` — the hub dashboard,
  cause-and-effect flow, and department view, ported from the original
  `mechanics-os.jsx` prototype. Visual design (blueprint/schematic
  styling, fonts, panel corners, gauges) is unchanged; the only
  difference is data now comes from the API instead of `window.storage`.

## Deploying to the internal server

This is a single deployable Next.js app — no separate frontend/backend
to stand up. What changes between local dev and the internal server:

1. **Environment variables.** Set real values for `DATABASE_URL`,
   `JWT_SECRET`, on the server (not the `.env` file — use whatever
   secrets mechanism the server uses, e.g. a systemd `EnvironmentFile`
   or your process manager's env config). Generate a fresh
   `JWT_SECRET` for production — don't reuse the dev one.
2. **Database location.** Point `DATABASE_URL` at a persistent path
   outside the deploy directory (e.g. `file:/var/lib/mechanics-os/prod.db`)
   so redeploys don't wipe or orphan the database. Back that file up —
   it's the only copy of your KPI/SOP data.
3. **Cookies over HTTPS.** The session cookie is marked `secure` when
   `NODE_ENV=production`, which requires the app to be served over
   HTTPS (or from behind a reverse proxy that terminates TLS and the
   app trusts). Put it behind your internal reverse proxy (nginx,
   Caddy, IIS, etc.) with a real TLS cert, or the login cookie won't be
   set by browsers.
4. **Build instead of dev.** Run `npm run build` once, then
   `npm run start` (or `npm run prisma:deploy` — the non-interactive
   equivalent of `prisma:migrate` — followed by `npm run start`) as the
   long-running process, instead of `npm run dev`.
5. **Migrations.** Use `npm run prisma:deploy` (`prisma migrate
   deploy`) on the server instead of `prisma:migrate` — it applies
   already-created migrations without prompting or trying to create new
   ones from schema drift.
6. **Seeding.** Only run `npm run prisma:seed` once, against the
   production database, the first time you stand it up. Running it
   again is safe (it upserts departments/KPIs/users rather than
   duplicating them) but there's no reason to repeat it.
7. **Process manager.** Run `npm run start` under whatever keeps
   long-running services alive on your server (systemd, pm2, Docker,
   etc.) so it restarts on crash/reboot.

Everything else — the schema, the auth model, the permission rules —
is identical between local dev and the deployed app.

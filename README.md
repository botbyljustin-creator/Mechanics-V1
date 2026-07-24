# Mechanics_OS

Internal operating system for the 6 Mechanics business systems (Business
Development, Operations, Finance, People, Technology & Automation,
Leadership). Next.js + PostgreSQL (via Prisma), single deployable app.

## What this is

- **Hub dashboard** — the schematic wheel view of all 6 departments with
  live health indicators, plus the cause-and-effect flow panel.
- **Department view** — KPI Gauges at the top, then Includes/Outputs,
  then SOPs.
- **Includes / Outputs as metrics** — every bullet under "Includes" and
  "Outputs" (e.g. "Lead generation") is its own trackable item, not
  just a label. Click a bullet to expand it. Each one can be tracked
  either way:
  - **Number** — a gauge with an actual value and a target, same as
    the KPI gauges.
  - **Status** — a highlight/red-flag: On Track / Watch / Red Flag,
    plus a short freeform note. Better fit for things that aren't
    naturally a percentage (most Includes/Outputs bullets).
  Whoever can edit a department can switch a bullet between the two
  at any time — the toggle is right there in the edit view. Existing
  numeric bullets stay numeric until someone deliberately switches
  them; new bullets default to Status.
- **Accounts** — one login per department (department head), one
  Leadership account, and one Admin account.
- **Permissions** — everyone can view every department read-only.
  A department head can edit their own department's KPIs, Includes/
  Outputs metrics, and SOPs. Leadership and Admin can edit every
  department.
- **Data** — PostgreSQL database (via Prisma) with real tables:
  `Department`, `User`, `Kpi`, `KpiHistory`, `MetricItem`,
  `MetricItemHistory`, `Sop`. Every KPI and metric edit is appended to
  its history table (who changed it, old/new values, when) so nothing
  is silently overwritten.

## Free hosted demo (Vercel + Neon)

The fastest way to get a real clickable URL, at $0 and no local install:

1. **Create a free Postgres database at [neon.tech](https://neon.tech).**
   Sign up, create a project, and copy the connection string it gives you
   (looks like `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require`).
2. **Deploy to [vercel.com](https://vercel.com).** Sign up with your
   GitHub account, click **Add New → Project**, and import this repo
   (`botbyljustin-creator/mechanics-v1`, branch `claude/mechanics-os-web-app-2k3qhg`
   or whatever it's been merged into). Vercel auto-detects Next.js — no
   config needed.
3. **Set environment variables** in the Vercel project settings before
   (or right after) the first deploy:
   - `DATABASE_URL` — the Neon connection string from step 1
   - `JWT_SECRET` — any long random string (e.g. from `openssl rand -base64 48`)
   - `SEED_DEFAULT_PASSWORD` — optional, defaults to `ChangeMe123!`
4. **Apply the schema and load starting data.** Vercel runs the app but
   won't create tables or accounts for you. From any machine with
   internet access (this includes asking whoever set this up to run it
   once), with `DATABASE_URL` set to the same Neon connection string:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```
5. Open the `.vercel.app` URL Vercel gives you, and log in with one of
   the seeded accounts below.

This gets you a real, working, permanent link. It's still a third-party
host, not your internal server — see the next section for that move.

## Running it locally

Requires Node 20+ and a PostgreSQL database (a free Neon project works
fine for this too — you don't need Postgres installed on your machine).

```bash
npm install
cp .env.example .env        # then edit .env — set DATABASE_URL to your Postgres connection string
npm run prisma:migrate      # applies the schema
npm run prisma:seed         # loads the 6 departments + 7 accounts
npm run dev                 # http://localhost:3000
```

`.env` needs:

- `DATABASE_URL` — a PostgreSQL connection string.
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

- `prisma/schema.prisma` — the 7 tables (`Department`, `User`, `Kpi`,
  `KpiHistory`, `MetricItem`, `MetricItemHistory`, `Sop`) and the
  `Role` (`ADMIN`, `LEADERSHIP`, `DEPT_HEAD`) and `MetricSection`
  (`INCLUDE`, `OUTPUT`) enums.
- `prisma/seed.js` — loads the 6 departments/KPIs/SOPs (carried over
  1:1 from the original prototype and the Mechanics reference doc),
  creates a `MetricItem` row for every Includes/Outputs bullet, and
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

## Deploying to your internal server

This is a single deployable Next.js app — no separate frontend/backend
to stand up. What changes between the free hosted demo and your own
internal server:

1. **Postgres.** Either keep using a Neon project (fine to run
   production on the free tier's paid successor plans, or just keep it
   external), or point `DATABASE_URL` at a Postgres instance on your
   own network/server. Nothing else in the app changes either way.
2. **Environment variables.** Set real values for `DATABASE_URL` and
   `JWT_SECRET` on the server (not the `.env` file — use whatever
   secrets mechanism the server uses, e.g. a systemd `EnvironmentFile`
   or your process manager's env config). Generate a fresh `JWT_SECRET`
   for production — don't reuse the dev/demo one.
3. **Cookies over HTTPS.** The session cookie is marked `secure` when
   `NODE_ENV=production`, which requires the app to be served over
   HTTPS (or from behind a reverse proxy that terminates TLS and the
   app trusts). Put it behind your internal reverse proxy (nginx,
   Caddy, IIS, etc.) with a real TLS cert, or the login cookie won't be
   set by browsers.
4. **Build instead of dev.** Run `npm run build` once, then
   `npm run start` as the long-running process, instead of `npm run dev`.
5. **Migrations.** Use `npm run prisma:deploy` (`prisma migrate
   deploy`) on the server instead of `prisma:migrate` — it applies
   already-created migrations without prompting or trying to create new
   ones from schema drift.
6. **Seeding.** Only run `npm run prisma:seed` once, against the
   production database, the first time you stand it up (skip it if
   you're pointing at the same Neon database the free demo already
   seeded). Running it again is safe (it upserts departments/KPIs/users
   rather than duplicating them) but there's no reason to repeat it.
7. **Process manager.** Run `npm run start` under whatever keeps
   long-running services alive on your server (systemd, pm2, Docker,
   etc.) so it restarts on crash/reboot.

Everything else — the schema, the auth model, the permission rules —
is identical across local dev, the hosted demo, and your internal server.

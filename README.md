# QuickCargo - Instant Truck Booking Platform

QuickCargo is a full-stack SaaS MVP for instant truck booking with pricing, booking, tracking simulation, and a basic driver workflow.

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion + Axios
- Backend: Node.js + Express (MVC)
- Database: PostgreSQL
- Auth: JWT

## MVP Features

- User signup/login with JWT
- Booking flow: pickup, drop, cargo size, date, **hourly slots** (capacity per cargo size), optional services
- **Priority service** add-on (extra fee, shown in instant quote)
- Instant pricing engine (`priorityFee` + optional line items)
- Slot availability API; booking uses a **DB transaction** (advisory lock + capacity check + `FOR UPDATE SKIP LOCKED` driver pick) to avoid double-booking races
- Auto vehicle + available driver assignment (mock nearest logic)
- Booking confirmation with generated booking ID
- Simulated live tracking with progress/GPS/ETA
- Driver login and ride status update
- Dashboard: active/past bookings and payments

## Docker (Recommended)

### Start all services

```bash
docker compose up --build
```

### URLs

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

### Stop

```bash
docker compose down
```

### Stop + remove DB volume

```bash
docker compose down -v
```

### After you change code (important)

Docker **reuses old image layers** until you rebuild. If the API looks outdated (404s, missing routes), run a **clean rebuild**:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Check containers and health:

```bash
docker compose ps
docker compose logs server --tail 30
```

Open `http://localhost:5000/health` — you should see JSON. Slots: `http://localhost:5000/bookings/slots?date=2026-03-24&cargoSize=Small`.

The **browser** calls `http://localhost:5000` for the API (`VITE_API_URL` is baked at **client image build** time). Rebuild the **client** image if you change that URL.

### Docker with bind mounts (live code, no rebuild)

Use **`docker-compose.dev.yml`** when you want edits on your machine to show up **immediately** (nodemon + Vite HMR):

```bash
docker compose -f docker-compose.dev.yml up
```

- **Frontend:** `http://localhost:5173` (Vite dev server)
- **API:** `http://localhost:5000`
- **How it works:** `./server` and `./client` are **bind-mounted** into the containers; **`node_modules`** are stored in **named volumes** so the mount does not delete them. First start may run `npm ci` once.

Stop the **production** stack (`docker compose down`) first if ports **5000**, **5432**, or **5173** are already in use.

## Manual Run (Without Docker)

### Backend

1. Create DB `quickcargo` in PostgreSQL.
2. In `server/`, copy `.env.example` to `.env`.
3. Set:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quickcargo`
   - `JWT_SECRET=your_secret`
4. Run:
   - `npm install`
   - `npm run dev`

### Frontend

1. In `client/` run:
   - `npm install`
   - `npm run dev`
2. Open `http://localhost:5173`

## Deploy a live demo ($0)

Stack: **Vercel (frontend)** + **free Postgres (Neon or Supabase)** + **free API host (Render)**. No paid services required for a small demo; free tiers may **sleep** when idle (first request after idle can be slow).

### Supabase docs vs this repo (read this)

Official snippets often assume **Next.js** (`page.tsx`, `@supabase/ssr`, `.env.local` with `NEXT_PUBLIC_*`). **This project is Vite + React + Express** with **JWT auth** and **PostgreSQL via `pg`**. You do **not** add those Next.js files here.

**Use Supabase as Postgres only:** in the Supabase dashboard go to **Project Settings → Database** and copy the **URI** connection string (or use the “Transaction” pooler string for serverless hosts). Put it in **`DATABASE_URL`** on your **API** (Render), not in the Vite client. Set **`DB_SSL=true`**. No `@supabase/supabase-js` is required for that.

**Optional later:** `@supabase/supabase-js` in the **client** only makes sense if you **replace** JWT auth with Supabase Auth — a large refactor. For a live demo, keep the current API auth.

**Security:** never commit API keys or paste them in public chats. If keys were exposed, **rotate** them in Supabase (**Settings → API**).

### 1) Database (Neon or Supabase)

**Neon**

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Copy the **connection string** (PostgreSQL). It usually requires SSL.
3. Set `DATABASE_URL` and `DB_SSL=true` on the API host.

**Supabase (Postgres only)**

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. **Settings → Database** → copy the **Connection string** (URI format, replace `[YOUR-PASSWORD]` with your DB password).
3. On Render (API service), set **`DATABASE_URL`** to that string and **`DB_SSL=true`**.
4. Do **not** put Supabase service role keys in the browser; the React app only talks to **your Express API**.

### 2) API on Render (free web service)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → connect **this GitHub repo**.
2. **Root directory:** `server`
3. **Runtime:** Node
4. **Build command:** `npm ci` (or `npm install`)
5. **Start command:** `npm start`
6. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Neon or Supabase Postgres URI (see above) |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | Long random string (generate locally; do not commit) |
   | `PORT` | Often set automatically by Render; if empty, the app defaults internally |

7. Deploy and copy the **HTTPS URL** (e.g. `https://quickcargo-api.onrender.com`). Check `GET /health`.

**Note:** Render free services **spin down** after inactivity. The first browser request after sleep may take **30–60+ seconds**.

### 3) Frontend on Vercel (Hobby)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo.
2. **Root directory:** `client`
3. **Framework preset:** Vite (or leave auto-detect).
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your Render API URL, e.g. `https://your-service.onrender.com` (no trailing slash) |

5. Deploy. Open the **Vercel URL** — the app will call the API using `VITE_API_URL` ([client/src/services/api.js](client/src/services/api.js)).

[`client/vercel.json`](client/vercel.json) adds SPA routing so deep links like `/dashboard` work on refresh.

### 4) Smoke test

- Sign up / log in, load **slots**, create a **booking**.
- If the API “hangs” once, wait and retry (cold start).

## Key API Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /pricing/estimate` — body may include `priority: true`
- `GET /bookings/slots?date=YYYY-MM-DD&cargoSize=Small|Medium|Large|XL` — returns each slot with `capacity`, `booked`, `available`, `isAvailable`
- `POST /bookings` (JWT required) — body must include `slotDate`, `slotLabel` (e.g. `08:00-09:00`), optional `priority`
- `GET /bookings/dashboard` (JWT required)
- `GET /bookings/tracking` (JWT required)
- `POST /drivers/login`
- `PATCH /drivers/ride-status`

## Driver Demo Phones

- `9000000001` (bike)
- `9000000002` (pickup)
- `9000000003` (mini truck)
- `9000000004` (lorry)

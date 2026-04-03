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

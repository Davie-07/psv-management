## TrustDrive – Local Transport Platform

This repository hosts TrustDrive, a MERN-based platform for managing PSV, tuktuk, and boda-boda operations plus parcel workflows between stage managers and customers.

### Current State
- `docs/system-design.md` – requirement + architecture notes (TrustDrive naming).
- `backend/` – Express + Mongo API with auth, RBAC, parcel lifecycle, and driver/stage/admin endpoints.
- `frontend/` – React (Vite) dashboards for admin, driver, stage manager, and parcel customers.

### Getting Started
1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Environment variables (create `backend/.env`; see `backend/env.sample` for a copyable template):
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/trustdrive
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=12h
PARCEL_TOKEN_SECRET=replace-with-parcel-secret
PARCEL_TOKEN_EXPIRES_IN=30m
SEED_ADMIN_EMAIL=admin@trustdrive.local
SEED_ADMIN_PASSWORD=Admin@1234
SEED_STAGE_EMAIL=manager@trustdrive.local
SEED_STAGE_PASSWORD=Stage@1234
SEED_STAGE_NAME=CBD Terminus
SEED_STAGE_LOCATION=Nairobi CBD
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:4000/api
```

### Seed default accounts
With the backend dependencies installed and `.env` configured, run:
```bash
cd backend
npm run seed:users
```
This creates:
- Administrator – `admin@trustdrive.local` / `Admin@1234`
- Stage Manager (assigned to `CBD Terminus`) – `manager@trustdrive.local` / `Stage@1234`
Override credentials or stage data via the `SEED_*` env vars before running the script.

### Features
- Admin dashboard: manage stages, assign managers, register PSV drivers, create quotes.
- Driver app: welcome quote, vehicle info, passenger log updates, parcel assignments with bottom nav.
- Stage manager app: PSV-only – send parcels, track outgoing/incoming lists, confirm arrivals, record vehicle departures/returns with live daily counts (auto-reset at midnight).
- Parcel customer flow: temporary login via order number + name, live receipt updates, final confirmation deletes the order and token.
- Session persistence: auth tokens are stored in `localStorage`, so refreshing the browser (e.g., on Vercel) keeps users signed in until the token expires or they log out manually.
- **Security**: Comprehensive protection against injection attacks, rate limiting, input validation, error sanitization, and console data leakage prevention. See `docs/SECURITY.md` for details.

### Preparing for git push
1. Install dependencies (one-time per folder): `npm install` inside both `backend/` and `frontend/`.
2. Copy `backend/env.sample` to `backend/.env` and fill in real secrets; never commit `.env`.
3. Run `npm run lint` (frontend) and `npm run lint` (backend) if you enable ESLint rules.
4. Commit everything except `node_modules`/`.env` (`git status` should show only tracked files) and push to GitHub.

### Deployment

#### Backend (Render)
1. Render can auto-provision from `render.yaml`.
2. Create a new **Web Service** from your GitHub repo, point it at `backend/`, Node runtime.
3. Build command: `npm install`; Start command: `npm run start`.
4. Configure environment variables exactly as in `backend/env.sample`.
5. Once deployed, note the public URL (e.g., `https://trustdrive-backend.onrender.com`) and expose `/api/*` endpoints.

#### Frontend (Vercel)
1. Connect the repo to Vercel and select the `frontend/` folder as the project root.
2. Framework preset: **Vite**. Build command: `npm run build`; output dir: `dist`.
3. Environment variables:
   - `VITE_API_URL=https://<render-app>.onrender.com/api`
4. Because auth data lives in `localStorage`, page reloads or direct URL visits on Vercel keep the previous session until logout/expiry.
5. After deployment, set up a custom domain or use the default Vercel URL and verify login + parcel flows.

> Tip: when testing locally against the hosted backend, set `VITE_API_URL` to the Render URL in `frontend/.env`.


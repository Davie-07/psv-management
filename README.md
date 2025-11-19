## TrustDrive – Local Transport Platform

This repository hosts TrustDrive, a MERN-based platform for managing PSV operations plus parcel workflows between stage managers and customers.

### Current State
- `docs/system-design.md` – requirement + architecture notes
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



### Features
- Admin dashboard: manage stages, assign managers, register PSV drivers, create quotes.
- Driver app: welcome quote, vehicle info, passenger log updates, parcel assignments with bottom nav.
- Stage manager app: PSV-only – send parcels, track outgoing/incoming lists, confirm arrivals, record vehicle departures/returns with live daily counts (auto-reset at midnight).
- Parcel customer flow: temporary login via order number + name, live receipt updates, final confirmation deletes the order and token.
- Session persistence: auth tokens are stored in `localStorage`, so refreshing the browser (e.g., on Vercel) keeps users signed in until the token expires or they log out manually.
- **Security**: Comprehensive protection against injection attacks, rate limiting, input validation, error sanitization, and console data leakage prevention. See `docs/SECURITY.md` for details.

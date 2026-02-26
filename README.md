# GoLogin Control Center

## 🚀 Clone & Run (Fastest)

```bash
git clone https://github.com/CBGROWTHOPS/gologin-control
cd gologin-control
./run_local.sh
```

**Backend:** http://127.0.0.1:8000  
**Frontend:** http://localhost:5173  

Proxy status indicator in sidebar shows live/offline.

---

Personal local UI for managing GoLogin browser profiles and proxies. No database, no cloud deploy — runs entirely on your machine.

## Prerequisites

- **GoLogin API token** in `~/Documents/permissions/ARC_API_KEYS.txt` (GOSCREEN/GOLOIGN section)
- **Python 3.9+** for the backend
- **Node 18+** for the frontend

Get a fresh token from [app.gologin.com](https://app.gologin.com) → Settings → API.

## Run

**Fastest (one command):**

```bash
./run_local.sh
```

Starts backend (port 8000) and frontend (port 5173). Open http://localhost:5173. Stop with Ctrl+C.

**Or run backend and frontend separately:**

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. Optional: copy `backend/.env.example` to `backend/.env` for overrides (e.g. `PORT`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. The UI shows **Proxy live** / **Proxy offline** so you know when the backend is up. All `/api` requests are proxied to the backend (no CORS).

## Features

- **Profiles** — List, search, rename, delete profiles
- **Create Profile** — Quick profile with random fingerprint (name, OS, osSpec)
- **Add Proxy** — Create GoLogin mobile/residential/DC proxy, optionally link to profile
- **Quick Create** — One-click profile + NY mobile proxy (same as `create_gologin_offers_profile.py`)
- **Traffic** — View proxy traffic remaining

## API

The backend proxies to `https://api.gologin.com`. Token is read from the local permissions file — never sent anywhere except GoLogin's API.

## Screenshots

Add to the repo for README polish:

- **UI:** `docs/screenshot.png` — full Control Center UI
- **Proxy indicator:** `docs/proxy-status.gif` — sidebar showing ● Proxy live / ○ Proxy offline

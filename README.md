# GoLogin Control Center

Personal local UI for managing GoLogin browser profiles and proxies. No database, no cloud deploy — runs entirely on your machine.

## Prerequisites

- **GoLogin API token** in `~/Documents/permissions/ARC_API_KEYS.txt` (GOSCREEN/GOLOIGN section)
- **Python 3.9+** for the backend
- **Node 18+** for the frontend

Get a fresh token from [app.gologin.com](https://app.gologin.com) → Settings → API.

## Run

### 1. Backend

```bash
cd gologin-control/backend
python -m venv .venv
source .venv/bin/activate   # or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### 2. Frontend

```bash
cd gologin-control/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. Open that URL in your browser.

## Features

- **Profiles** — List, search, rename, delete profiles
- **Create Profile** — Quick profile with random fingerprint (name, OS, osSpec)
- **Add Proxy** — Create GoLogin mobile/residential/DC proxy, optionally link to profile
- **Quick Create** — One-click profile + NY mobile proxy (same as `create_gologin_offers_profile.py`)
- **Traffic** — View proxy traffic remaining

## API

The backend proxies to `https://api.gologin.com`. Token is read from the local permissions file — never sent anywhere except GoLogin's API.

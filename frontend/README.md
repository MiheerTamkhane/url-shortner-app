# Shortly (Frontend)

React + TypeScript + Vite client for the URL Shortener API.

## Features

- Public marketing landing page
- Signup / login with JWT stored in `localStorage`
- Dashboard to shorten, list, copy, and delete links

## Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3000` (see [`../backend/README.md`](../backend/README.md))

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

### Environment

| Variable | Description |
| -------- | ----------- |
| `VITE_API_URL` | Backend origin (default `http://localhost:3000`) |

Used for API calls and for building short links like `{VITE_API_URL}/{shortCode}`.

### Local API connectivity

The backend enables CORS for the Vite origin. The Vite config also proxies `/user`, `/shorten`, and `/codes` to `http://localhost:3000` as a fallback for same-origin requests during development.

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Routes

| Path | Access |
| ---- | ------ |
| `/` | Public landing |
| `/login` | Guest only |
| `/signup` | Guest only |
| `/dashboard` | Authenticated |

Implementation plan: [`../docs/frontend-plan.md`](../docs/frontend-plan.md).

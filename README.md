# URL Shortener App

Full-stack URL shortener that turns long URLs into short, shareable links with JWT auth, PostgreSQL persistence, and HTTP redirects. Use the **Shortly** web UI to sign up, log in, and manage your links.

## Project Structure

```text
url-shortner-app/
├── backend/          # Express + TypeScript API, Drizzle ORM, PostgreSQL
│   ├── src/
│   ├── docker-compose.yml
│   └── README.md     # Detailed API reference & architecture
├── frontend/         # React 19 + TypeScript + Vite (Shortly UI)
└── docs/             # Implementation plans and project docs
```

## Features

- User signup and login with JWT authentication
- Shorten URLs (optional custom short codes; otherwise auto-generated via `nanoid`)
- Redirect short codes to the original URL (`GET /:shortCode`)
- List and delete short URLs for the authenticated user
- Request validation with Zod
- Password hashing with per-user salt (HMAC-SHA256)

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, TypeScript, Vite                      |
| Backend  | Node.js, Express 5, TypeScript                  |
| Database | PostgreSQL 17, Drizzle ORM                      |
| Auth     | JSON Web Tokens (JWT)                           |
| DevOps   | Docker Compose (local Postgres)                 |

## Prerequisites

- Node.js 18+
- npm
- Docker & Docker Compose (for local PostgreSQL)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MiheerTamkhane/url-shortner-app.git
cd url-shortner-app
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

This starts Postgres with:

- **Database:** `url_shortner_db`
- **User:** `postgres`
- **Password:** `mysecretpassword`
- **Port:** `5433` (mapped to Postgres `5432` in Docker; avoids conflicts with a local Postgres on `5432`)

### 3. Configure the backend

Create a `.env` file in `backend/`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5433/url_shortner_db
JWT_SECRET=super-secret-jwt-key
```

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

API runs at `http://localhost:3000`.

### 4. Start the frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

Vite serves the UI at `http://localhost:5173` (landing, auth, and dashboard). Create `frontend/.env` from `frontend/.env.example` if needed (`VITE_API_URL=http://localhost:3000`).

## API Overview

Base URL: `http://localhost:3000`

| Method | Endpoint       | Auth | Description                          |
| ------ | -------------- | ---- | ------------------------------------ |
| POST   | `/user/signup` | No   | Register a new user                  |
| POST   | `/user/login`  | No   | Login and receive a JWT              |
| POST   | `/shorten`     | Yes  | Create a short URL                   |
| GET    | `/codes`       | Yes  | List short URLs for the current user |
| DELETE | `/:id`         | Yes  | Delete a short URL by ID             |
| GET    | `/:shortCode`  | No   | Redirect to the original URL         |

Authenticated requests need:

```http
Authorization: Bearer <jwt-token>
```

For full request/response examples, schema details, and error codes, see [backend/README.md](./backend/README.md).

System design notes live in [backend/system-design.md](./backend/system-design.md).

## Docs

- [Frontend implementation plan](./docs/frontend-plan.md) — landing page, auth, dashboard, and API wiring guide

## Scripts

### Backend (`backend/`)

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start API with hot reload (`tsx`)  |
| `npm run build`     | Compile TypeScript                 |
| `npm start`         | Run compiled server                |
| `npm run db:generate` | Generate Drizzle migrations      |
| `npm run db:push`   | Push schema to the database        |
| `npm run db:studio` | Open Drizzle Studio                |

### Frontend (`frontend/`)

| Script           | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start Vite dev server    |
| `npm run build`  | Typecheck and production build |
| `npm run preview`| Preview production build |
| `npm run lint`   | Run ESLint               |

## License

This project is licensed under the ISC License.

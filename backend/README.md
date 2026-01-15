<h1 align="center">URL Shortener API (Backend)</h1>

Simple, secure URL Shortener backend built with Node.js, Express, TypeScript, PostgreSQL, and Drizzle ORM. It provides APIs to register/login users, shorten long URLs (with optional custom codes), and redirect short codes to their original targets.

---

## Architecture Overview

- **API Layer**: Express 5 application (`src/app.ts`) exposing REST endpoints for auth and URL management.
- **Authentication**: JWT-based auth with:
	- `authenticate` middleware parsing `Authorization: Bearer <token>` and attaching `req.user`.
	- `ensureAuthenticated` middleware enforcing auth on protected routes (e.g. `POST /shorten`).
- **Validation**: Request bodies validated via Zod schemas in `src/validations`.
- **Persistence**:
	- PostgreSQL as the main data store.
	- Drizzle ORM for schema definition and type-safe queries.
- **URL Shortening Flow**:
	- Authenticated user calls `POST /shorten` with a long URL and optional custom code.
	- Backend stores mapping in `urls` table and returns the short code.
	- Anonymous clients hit `GET /:shortCode` to be redirected to the original URL.

---

## Tech Stack

| Category         | Technology                         |
| ---------------- | ---------------------------------- |
| Runtime          | Node.js (TypeScript)              |
| Web Framework    | Express 5                          |
| Database         | PostgreSQL                         |
| ORM              | Drizzle ORM                        |
| Auth             | JSON Web Tokens (JWT)              |
| Validation       | Zod                                |
| Containerization | Docker + Docker Compose (Postgres) |

---

## Prerequisites

Make sure you have installed:

- Node.js 18+
- npm (comes with Node.js)
- Docker & Docker Compose (for local PostgreSQL)
- Postman / Insomnia or any HTTP client (for testing)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MiheerTamkhane/url-shortner-app.git
cd url-shortner-app/backend
```

### 2. Start PostgreSQL with Docker

```bash
docker compose up -d
```

This uses `docker-compose.yml` to start a local PostgreSQL instance with:

- Database: `url_shortner_db`
- User: `postgres`
- Password: `mysecretpassword`
- Port: `5432`

### 3. Configure environment variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Example `.env` contents:

```env
PORT=3000
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5432/url_shortner_db
JWT_SECRET=super-secret-jwt-key
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run database migrations / schema sync

Drizzle is configured via `drizzle.config.ts`.

```bash
# Generate migrations from current schema
npm run db:generate

# Push schema to the database
npm run db:push
```

### 6. Run the server (development)

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the `PORT` defined in `.env`).

For production:

```bash
npm run build
npm start
```

---

## API Reference

Base URL (local):

```text
http://localhost:3000
```

### Authentication

#### POST /user/signup

Register a new user.

- **Auth**: Not required

Request body:

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john.doe@example.com",
	"password": "secret123"
}
```

Success response `201 Created`:

```json
{
	"message": "User created successfully",
	"data": {
		"id": "<user-uuid>"
	}
}
```

Error responses:

- `400 Bad Request` – Validation errors
- `409 Conflict` – User with this email already exists
- `500 Internal Server Error`

---

#### POST /user/login

Login with email and password to obtain a JWT.

- **Auth**: Not required

Request body:

```json
{
	"email": "john.doe@example.com",
	"password": "secret123"
}
```

Success response `200 OK`:

```json
{
	"message": "Login successfully!",
	"token": "<jwt-token>"
}
```

Error responses:

- `400 Bad Request` – Validation errors or invalid credentials
- `404 Not Found` – User with email does not exist

---

### URL Shortening

#### POST /shorten

Create a new short URL for a given target URL.

- **Auth**: Required (JWT in `Authorization` header)

Headers:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:

```json
{
	"url": "https://example.com/very/long/url",
	"code": "my-custom-code"
}
```

- `url` – required, must be a valid URL
- `code` – optional; if omitted a random 7-character code is generated

Success response `201 Created` (shape may vary):

```json
{
	"result": {
		"id": "<url-uuid>",
		"targetURL": "https://example.com/very/long/url",
		"shortCode": "my-custom-code"
	},
	"message": "URL shortened successfully"
}
```

Error responses:

- `400 Bad Request` – Invalid body / URL format
- `401 Unauthorized` – Missing or invalid JWT

---

#### GET /:shortCode

Redirect to the original URL for the given short code.

- **Auth**: Not required

Example:

```http
GET /my-custom-code
Host: localhost:3000
```

Behavior:

- If a record is found, responds with `302` redirect to the stored `target_url`.
- If not found, responds with `404` and JSON error:

```json
{
	"error": "Invalid URL"
}
```

---

## Database Schema

The project uses PostgreSQL with Drizzle ORM. Main tables:

### users

Represents registered users.

| Column     | Type      | Constraints                 |
| ---------- | --------- | --------------------------- |
| id         | uuid      | PK, default random UUID     |
| first_name  | varchar   | required, max length 55     |
| last_name  | varchar   | optional, max length 55     |
| email      | varchar   | required, unique, max 255   |
| password   | text      | required (hashed password)  |
| salt       | text      | required (per-user salt)    |
| created_at | timestamp | default `now()`, not null   |
| updated_at | timestamp | auto-updated on row change  |

### urls

Represents shortened URLs created by users.

| Column      | Type      | Constraints                            |
| ----------- | --------- | -------------------------------------- |
| id          | uuid      | PK, default random UUID                |
| user_id     | uuid      | FK to `users.id`, not null             |
| target_url  | text      | required (original long URL)           |
| short_code  | varchar   | required, unique, max length 55        |
| created_at  | timestamp | default `now()`, not null              |
| updated_at  | timestamp | auto-updated on row change             |

Password hashing is done using Node's `crypto` HMAC-SHA256 with a per-user random salt.

---

## Environment Variables

| Variable      | Required | Description                                      |
| ------------- | -------- | ------------------------------------------------ |
| `PORT`        | No       | Port for the HTTP server (default: `3000`)       |
| `DATABASE_URL`| Yes      | PostgreSQL connection string                     |
| `JWT_SECRET`  | Yes      | Secret key for signing and verifying JWT tokens  |

---

## Future Improvements

Some planned or potential enhancements:

- **URL analytics**: Track total clicks, last accessed time, referrers, and user agents.
- **Expiration & disabling**: Allow URLs to expire after a date or number of uses.
- **Rate limiting**: Protect against abuse by limiting requests per IP/user.
- **Custom domains**: Support mapping short codes under custom domains.
- **QR code generation**: Generate QR codes for each short URL.
- **Admin dashboard**: Manage users and URLs, view system metrics.
- **Soft deletes & audit logging**: Track changes and safely restore deleted URLs.

---

## License

This project is licensed under the ISC License.


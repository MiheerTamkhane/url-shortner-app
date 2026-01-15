# URL Shortener – System Design (Project-Specific)

This document explains the system design of **your** URL Shortener backend, in the style of a FAANG system design interview, but in plain English and tied directly to this implementation.

---

## 1. Requirements Analysis

### 1.1 Functional Requirements (What the system does)

At a high level, the system should:

1. **Shorten long URLs**
   - Given a long URL, generate a **short code** (e.g. `https://short.ly/abc1234`).
   - Optionally accept a **custom code** if the user provides one.

2. **Redirect short URLs**
   - When someone hits `GET /:shortCode`, look up the corresponding long URL and respond with an HTTP redirect.

3. **User registration and login**
   - `POST /user/signup`: Create a user with email + password.
   - `POST /user/login`: Verify credentials and return a **JWT** token.

4. **Authenticated URL creation**
   - `POST /shorten`: Only authenticated users (valid JWT) can create short URLs.
   - Short URLs are **associated with the user** who created them.

5. **Basic validation and error handling**
   - Validate request bodies (e.g. URL format, email format, password length) using **Zod**.
   - Return clear JSON error messages for invalid input, not found, or unauthorized.

> Note: In a full production design, you might also add analytics (click counts, referrers, geo data), but your current implementation focuses on core CRUD + authentication.

---

### 1.2 Non-Functional Requirements

These are the system qualities that matter beyond just correctness.

1. **Availability**
   - The redirect path (`GET /:shortCode`) should be **highly available** because it’s the most frequently used path.
   - Short URL creation and user signup can tolerate slightly lower availability than reads.

2. **Latency**
   - Typical targets:
     - **Redirect latency**: < 100 ms from entering the short URL to receiving the redirect (within the same region).
     - **Write operations** (signup, login, shorten URL): < 200–300 ms is acceptable.
   - This implementation is a **single Express server + PostgreSQL** in one region, so intra-DC calls are fast.

3. **Consistency**
   - When a short URL is created, it should be **immediately usable** (strong consistency) so that `GET /:shortCode` works right away.
   - Using PostgreSQL with a single primary instance naturally gives you strong consistency.

4. **Durability**
   - Once a URL mapping is stored, it should not be lost.
   - PostgreSQL with disk-based storage + backups can provide this.

5. **Scalability**
   - The current implementation is **monolithic** and deployed on a single node, but the design should allow:
     - Horizontal scaling of stateless app servers.
     - Vertical and later horizontal scaling of the database (read replicas, sharding strategies).

6. **Security**
   - JWT-based authentication to protect URL creation endpoints.
   - Passwords are hashed using `crypto` with per-user salt.
   - JWTs are signed with a secret key.

---

## 2. Capacity Estimation (Back-of-the-Envelope Math)

Assume:

- **1,000,000 requests per day**.
- 90% reads (redirects), 10% writes (shorten + signup/login).
- We plan for **5 years** of data.

> These are approximate calculations you might walk through in an interview.

### 2.1 Requests Per Second (RPS)

1,000,000 requests/day:

- Requests per day: 1,000,000
- Seconds per day: 86,400

Average RPS:

- \( RPS = \frac{1,000,000}{86,400} \approx 11.6 \) requests/second

Peak traffic is often 5–10x the average. Assume **10x peak**:

- Peak RPS: ~120 requests/second
  - ~108 reads/sec (redirects)
  - ~12 writes/sec (shorten + auth)

This is **easily handled** by a single Express server and a single PostgreSQL instance, but real-world FAANG systems would design for much higher traffic.

### 2.2 Storage Estimation

Assume:

- **URL record size** ~ 300 bytes (rough estimate):
  - `id` (UUID): ~16 bytes
  - `user_id` (UUID): ~16 bytes
  - `target_url`: avg 200 bytes
  - `short_code`: ~10–20 bytes
  - Timestamps & overhead: ~60–80 bytes

- **Number of new URLs/day**: Suppose 100,000 new URLs/day (10% of total traffic).

Daily storage for URLs:

- 100,000 URLs/day × 300 bytes ≈ 30,000,000 bytes ≈ 30 MB/day

Over 1 year:

- 30 MB/day × 365 ≈ 10.95 GB ≈ **11 GB/year**

Over 5 years:

- 11 GB/year × 5 ≈ **55 GB**

Users table is much smaller compared to URLs, so we can ignore it for rough sizing.

So your PostgreSQL instance should plan for **~50–100 GB over 5 years**, which is reasonable for a single instance or a small cluster.

### 2.3 Bandwidth Estimation

A redirect response is small:

- HTTP headers + minimal HTML or no body: ~1 KB per response (very rough).

Bandwidth for 1,000,000 requests/day:

- 1,000,000 × 1 KB = 1,000,000 KB ≈ 1 GB/day of outbound traffic
- Per month: ~30 GB outbound

Incoming request payloads (POST /shorten, /login, /signup) are tiny relative to outbound responses; we can ignore them for a rough estimate.

---

## 3. High-Level Design

### 3.1 Components

Your current deployment (conceptually) looks like this:

1. **Clients**
   - Browsers, mobile apps, Postman.

2. **(Optional) Load Balancer**
   - In a bigger system you’d put something like an **AWS ALB** or Nginx in front of multiple app instances.
   - For now you have a single Express instance, but the logical design still applies.

3. **Application Servers** (Stateless)
   - Node.js + Express (TypeScript) running your API logic:
     - Auth routes (/user/signup, /user/login)
     - Shortening route (/shorten)
     - Redirect route (/:shortCode)

4. **Database Layer**
   - PostgreSQL running as a single instance locally (via Docker in your setup).
   - Accessed via **Drizzle ORM**.

5. **(Future) Caching Layer**
   - Redis for hot short codes and caching lookups.

### 3.2 Request Flows

#### 3.2.1 Short URL Creation (POST /shorten)

1. **Client** sends HTTP POST `/shorten` with JSON body containing 
   - `url`: long URL
   - `code` (optional): custom short code
   - Includes `Authorization: Bearer <jwt>` header.

2. **Load Balancer** (in a scaled setup) forwards request to one of the **Express app instances**.

3. **Express Middleware**:
   - `express.json()` parses JSON body.
   - `authenticate` middleware validates JWT and attaches `req.user`.
   - `ensureAuthenticated` middleware checks `req.user` and rejects if missing.

4. **Controller Logic** (`shortenUrl`):
   - Validates request body via Zod (`shortenUrlPostRequestSchema`).
   - Generates a short code:
     - Use `code` from the request if provided, otherwise use `nanoid(7)`.
   - Calls the **service layer** to insert a new record in `urls` table via Drizzle.

5. **Database (PostgreSQL)**:
   - Inserts `(user_id, target_url, short_code, timestamps)`.
   - Returns the inserted record.

6. **Response**:
   - Express returns `201 Created` with the new short URL code and metadata.

#### 3.2.2 Redirect (GET /:shortCode)

1. **Client** accesses a URL like `https://short.ly/abc1234`.

2. **DNS + Load Balancer**: Resolves domain and routes to one of your app servers.

3. **Express Route** (`redirectToTargetURL`):
   - Extracts `shortCode` from URL params.
   - Queries PostgreSQL (via Drizzle) for the corresponding `target_url`.

4. **Database**:
   - Looks up the row by `short_code`.
   - Returns the matching target URL (if any).

5. **Response**:
   - If found: respond with HTTP 302/307 redirect to the `target_url`.
   - If not found: respond with JSON `404 { "error": "Invalid URL" }`.

This flow is **read-heavy** and latency-sensitive, so caching can be introduced here later.

---

## 4. Core Algorithm Deep Dive (Short Code Generation)

### 4.1 Your Current Approach (nanoid-based random code)

In your code:

- If the user doesn’t specify a custom `code`, you call `nanoid(7)`.
- `nanoid` generates a **random, URL-safe ID** using an alphabet of letters and digits.
- This is conceptually similar to generating a **random Base62 string** of length 7.

Key properties:

1. **Low collision probability**
   - With a 62-character alphabet (A–Z, a–z, 0–9), the total space is:
     - \( 62^7 \approx 3.5 \times 10^{12} \) possible codes.
   - This is huge compared to the number of URLs you’ll store (even at FAANG scale), so random collisions are extremely unlikely.

2. **Non-sequential**
   - Codes do not reveal how many URLs are stored or creation order.
   - This can be good for **security and privacy**.

3. **Simple to implement**
   - No need for a central auto-increment counter.
   - Works well in a distributed environment, because you don’t coordinate ID generation.

### 4.2 Comparing to Base62 on Auto-Increment ID

Another common approach in interviews is:

- Use a database auto-increment `id` (1, 2, 3, ...).
- Convert this integer to a short string using **Base62 encoding**.

**Pros of Base62 + auto-increment:**

- Very simple to reason about.
- Guaranteed **no collisions** because each ID is unique.
- Easy to implement and debug.

**Cons:**

- IDs are **predictable** and sequential: users can guess how many URLs exist.
- In a **sharded or distributed database**, global auto-increment becomes tricky; you need coordination or separate ID generators.

### 4.3 Comparing to Hashing (e.g., MD5/SHA-1 of URL)

An alternative is using a hash (MD5, SHA-256) of the long URL and then truncating it.

**Pros:**

- Same URL always generates the same hash (idempotent), which can be useful.

**Cons:**

- Hash collisions, while rare, are theoretically possible; you must handle them.
- If you truncate too aggressively (e.g., 6 chars), collision probability rises.
- Hashes can be **longer** or require additional truncation and collision logic.

### 4.4 Is Your Strategy Good?

For your current scale and stack:

- **Random nanoid of length 7** is a very reasonable choice:
  - Massive keyspace, negligible collision risk.
  - No central ID coordination needed (future-friendly for horizontal scaling).
  - Non-sequential, which hides traffic/usage details.

To be safe in production, you would:

- Add a **unique constraint** on `short_code` (you already have this).
- If a collision happens during insert (rare), simply **retry** with a new code.

---

## 5. Database Design

### 5.1 Schema (What you already have)

You use **PostgreSQL** with two main tables, defined via **Drizzle ORM**:

1. **users**
   - `id` (UUID, primary key)
   - `first_name`, `last_name`
   - `email` (unique)
   - `password` (hashed string)
   - `salt` (per-user salt)
   - `created_at`, `updated_at`

2. **urls**
   - `id` (UUID, primary key)
   - `user_id` (FK to `users.id`)
   - `target_url` (text)
   - `short_code` (varchar, unique)
   - `created_at`, `updated_at`

### 5.2 Why SQL (PostgreSQL) is a good fit

**Pros:**

- **Strong consistency** by default: when a URL is written, subsequent reads see it.
- Well-known, mature technology with strong durability guarantees.
- Your data is **highly relational**:
  - URLs belong to users (FK).
  - You might later add analytics, which also relates to URLs and users.
- Supports ACID transactions and complex queries if you need them.

**Compared to NoSQL (e.g., MongoDB):**

- NoSQL could work too, especially for huge scale and very simple key-value-like access.
- However, because you already have *users* and *urls* and clear relationships, SQL keeps data integrity simpler.

### 5.3 Indexing Strategy

At minimum, you want indexes on:

- `urls.short_code` – for fast lookups in the redirect path.
- `urls.user_id` – for listing URLs per user (if you add such endpoints).
- `users.email` – for fast login.

PostgreSQL automatically indexes primary keys and unique constraints, so you’re mostly covered.

---

## 6. Scalability & Performance

### 6.1 Caching (Redis)

The redirect path is read-heavy and perfect for caching.

**Idea:**

- Put a **Redis cluster** in front of the database for short-code lookups.

Flow for `GET /:shortCode`:

1. Check Redis: `GET shortCode`.
2. If **hit**:
   - Immediately redirect to cached `target_url`.
3. If **miss**:
   - Query PostgreSQL.
   - If found, store in Redis with TTL (e.g., 24 hours): `SET shortCode targetURL`.
   - Then redirect.

Benefits:

- Greatly reduces load on PostgreSQL for hot URLs.
- Improves latency by serving from in-memory cache.

### 6.2 Handling Hot Keys (Viral Links)

A “hot key” is a very popular short URL that gets a huge amount of traffic.

**Problems with hot keys:**

- The database or even a single Redis node can become a bottleneck if all traffic for a viral URL hits the same place.

**Mitigations:**

1. **Cache the hot key aggressively:**
   - Very long TTL or even “pinned” cache entry.

2. **Use CDN / Edge caching:**
   - If your short domain is behind a CDN, you can return caching headers so the CDN caches the redirect response.

3. **Read replicas:**
   - PostgreSQL read replicas (if you can accept eventually consistent reads for redirects) can spread the load.

### 6.3 Horizontal Scaling

**Application Layer:**

- Your Express app is **stateless** (session is carried via JWT), so you can run multiple instances behind a load balancer.
- All instances talk to the same PostgreSQL + Redis.

**Database Layer:**

- Vertical scale first (bigger instance), then:
  - Add **read replicas** for analytics or non-critical reads.
  - Consider **sharding** by short_code prefix or user region at very high scale.

**Sharding example:**

- Use the first character of `short_code` to decide which shard to store and read from.
- Each shard is a separate PostgreSQL cluster.

### 6.4 Rate Limiting

To prevent abuse:

- Use a **rate limiter** (e.g. Redis-based token bucket) per IP or per user.
- Limit the number of `POST /shorten` requests per minute.

---

## 7. Bottlenecks & Single Points of Failure

### 7.1 Single App Instance

**Current state:**

- One Express server process.

**Issue:**

- If that process crashes, the entire service is down.

**Fix:**

- Run multiple app instances across different VMs/containers.
- Place a **load balancer** in front.
- Use health checks and auto-restart.

### 7.2 Single Database Instance (PostgreSQL)

**Issue:**

- If the DB instance goes down, you cannot create or resolve URLs.
- The DB can become a performance bottleneck at high load.

**Fixes:**

1. **High availability setup**:
   - Primary + standby replicas with automatic failover.

2. **Backups & PITR** (Point-in-Time Recovery):
   - To protect against data loss.

3. **Caching layer**:
   - Redis + CDN to reduce read load on DB.

4. **Sharding** (at very high scale):
   - Split data into multiple PostgreSQL clusters.

### 7.3 Single Redis Instance (if/when added)

**Issue:**

- If Redis goes down, cache miss rate spikes and DB load suddenly increases.

**Fix:**

- Use a **Redis cluster** with replication and proper failover.
- Implement **graceful degradation**: if Redis is down, system still works by going to DB.

### 7.4 Single Region Deployment

**Issue:**

- Users far from the data center experience higher latency.
- Regional outages can make the service unavailable.

**Fix:**

- Multi-region deployment:
   - App servers and caches in multiple regions.
   - Geo-aware routing (DNS) to route users to nearest region.
   - More complex data replication strategy for DBs.

---

## 8. Summary (How to Present in an Interview)

If you had to summarize this system design in a FAANG-style interview, you could say:

- **“Functionally, my URL shortener lets users sign up, log in, create short URLs, and redirect from short codes to original URLs. Non-functionally, I optimize for low-latency redirects and high availability on the read path.”**
- **“I use Node.js/Express as a stateless API layer, PostgreSQL as the source of truth with Drizzle ORM, and JWT for authentication. Short codes are generated with nanoid, which is conceptually similar to random Base62 IDs with a huge keyspace and very low collision probability.”**
- **“At moderate scale (1M requests/day), a single app + DB instance is fine, but the design is ready to scale horizontally with a load balancer, Redis cache for hot short codes, and eventually read replicas or sharding for PostgreSQL. I also consider rate limiting and edge/CDN caching for viral links.”**
- **“I recognize single points of failure (single app node, single DB, single region) and can address them with replication, failover, and multi-region deployment as traffic grows.”**

This connects your actual codebase to real-world system design concepts and shows that you understand both **what you built now** and **how you’d evolve it** at higher scale.
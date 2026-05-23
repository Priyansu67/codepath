# CodePath — System Design Document

## Overview

CodePath is a full-stack DSA Sheet web application built on the MERN stack (MongoDB, Express.js, React, Node.js), deployed on AWS EC2. It is publicly accessible — any visitor can browse all 193 problems across 14 DSA topics, view resources, difficulty levels, and company tags. Login is only required to track personal progress. The system is designed to handle 10k–50k concurrent users.

---

## 1. High-Level Architecture (HLD)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                       │
│   Vite + React 19 · TanStack Query · Tailwind CSS v4           │
│   Hosted: Nginx on EC2 · Domain: codepath.priyansu.in          │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTPS (TLS via Let's Encrypt)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                       │
│   • Serves static React build (dist/)                           │
│   • Proxies /api/* → Node.js backend on port 4000              │
│   • SSL termination · gzip compression                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               NODE.JS / EXPRESS API SERVER (Port 4000)          │
│                                                                  │
│   Middleware stack:                                              │
│   • Helmet (security headers)                                   │
│   • CORS (origin whitelist)                                     │
│   • express-rate-limit (100 req/min general, 10/min auth)       │
│   • Cookie-parser (httpOnly JWT cookies)                        │
│   • Zod request validation                                      │
│                                                                  │
│   Auth strategy:                                                 │
│   • optionalAuth — serves all users, enhances if logged in      │
│   • requireAuth  — blocks unauthenticated requests              │
│                                                                  │
│   Routers:  /auth  /topics  /progress  /admin                   │
│   Managed by: PM2 (process manager, auto-restart)              │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────────┐
│   MongoDB Atlas      │    │   Redis (localhost:6379)             │
│   (Primary DB)       │    │                                      │
│   Collections:       │    │   • JWT token blacklist (logout)     │
│   • users            │    │   • Progress stats cache (5 min TTL) │
│   • topics           │    │   • Graceful degradation if down     │
│   • problems         │    └─────────────────────────────────────┘
│   • userprogress     │
└──────────────────────┘
```

---

## 2. Public vs. Authenticated Access

| Route | Auth Required | Behaviour |
|---|---|---|
| `GET /api/topics` | No (optional) | Returns all topics. If logged in, includes per-topic completion stats. |
| `GET /api/topics/:slug` | No (optional) | Returns topic + all problems. If logged in, each problem includes `isCompleted`. |
| `GET /api/progress/stats` | **Yes** | Returns overall + per-difficulty completion stats for the logged-in user. |
| `POST /api/progress/toggle` | **Yes** | Marks a problem solved/unsolved for the logged-in user. |
| `POST /api/auth/login` | No | Issues JWT cookie. |
| `POST /api/auth/register` | No | Creates student account. |
| `/api/admin/*` | **Admin role** | Full CRUD for topics and problems. |

### `optionalAuth` Pattern

The topic routes use a middleware that attempts to verify the JWT cookie but does not reject the request if absent:

```
Request arrives at GET /api/topics/:slug
       │
       ▼
optionalAuth middleware:
  • JWT cookie present?
      Yes → verify → attach req.user (userId, role)
      No  → req.user = undefined  (continue normally)
       │
       ▼
topicService.getTopicBySlug(slug, req.user?._id)
  • userId provided → JOIN with userprogress → isCompleted per problem
  • userId absent   → return problems without completion status
```

This means unauthenticated users get the full DSA sheet (all problems, resources, difficulty, company tags, timers) — they just can't tick checkboxes. The moment they log in, their completion data is layered on top.

---

## 3. Request Flow

### Public browse (no login)
```
Browser → Nginx (HTTPS) → Express → optionalAuth (no cookie, passes through)
       → TopicService.getTopicBySlug(slug, undefined)
       → MongoDB: find problems by topicId, no UserProgress join
       → JSON response (isCompleted absent / false for all)
```

### Authenticated browse (logged-in student)
```
Browser (cookie: JWT) → Nginx → Express → optionalAuth
       → Verify JWT → attach req.user
       → TopicService.getTopicBySlug(slug, userId)
       → MongoDB: find problems + LEFT JOIN userprogress WHERE userId
       → JSON response (isCompleted per problem reflects saved state)
```

### Progress toggle
```
User checks a problem → optimistic UI update (instant)
       ↓
POST /api/progress/toggle  { problemId, isCompleted }
Cookie: JWT (requireAuth — rejects if not logged in)
       ↓
UserProgress.findOneAndUpdate(
  { userId, problemId },
  { isCompleted, completedAt },
  { upsert: true }
)
       ↓
Redis.del("stats:{userId}")   ← invalidate cached stats
       ↓
Response: 200 OK
TanStack Query invalidates local cache → re-fetches stats
```

---

## 4. Authentication Mechanism

**Strategy:** Stateless JWT stored in `httpOnly` cookies (XSS-proof).

```
POST /api/auth/login  { email, password }
       ↓
1. Find user by email (indexed)
2. bcrypt.compare(password, passwordHash)
3. Sign JWT:  { userId, role, tokenId (UUID), iat, exp: +7d }
4. Set-Cookie: token=<JWT>; httpOnly; Secure; SameSite=Strict
       ↓
Every protected request:
  Cookie → requireAuth middleware
    → jwt.verify() → decode payload
    → Redis.get("blacklist:{tokenId}") — check if revoked
    → attach req.user → route handler

Logout:
  → Redis.setex("blacklist:{tokenId}", remainingTTL, "1")
  → Clear cookie
```

**Security measures:**
- `bcrypt` with 12 salt rounds
- `tokenId` (UUID v4) in JWT payload — enables per-token revocation without a database hit on every request
- Auth endpoints rate-limited to 10 req/min
- Helmet sets `X-Content-Type-Options`, `X-Frame-Options`, HSTS headers

---

## 5. Data Flow — Progress Tracking (Resume on Next Login)

```
Student solves "Two Sum" → checks the checkbox
         │
         ▼  (optimistic update — UI marks instantly)
POST /api/progress/toggle → UserProgress upsert in MongoDB
         │
         ▼
Next visit (same session or new login):
GET /api/topics/arrays
  → backend joins problems with this user's UserProgress records
  → "Two Sum" comes back with isCompleted: true
  → UI renders checkbox as checked
  → Student resumes exactly where they left off
```

Progress is never stored in localStorage or session — it lives in MongoDB, so it persists across devices and browsers.

---

## 6. Scalability Considerations (10k–50k Users)

### Why the public-first model helps scale

Since most traffic is read-only (browsing problems without login), the topic and problem data can be aggressively cached. Anonymous requests never touch `userprogress` at all.

| Bottleneck | Solution |
|---|---|
| High read traffic (public browse) | Topics + problems are static after seeding. Redis caches topic responses (already implemented). At scale: move to CDN-cached responses or S3 + CloudFront. |
| Single EC2 instance | Add Application Load Balancer + 2–3 EC2 instances. PM2 cluster mode handles per-instance CPU scaling. JWT is stateless so any node can verify any request. |
| UserProgress write throughput | Upserts are per-user, naturally distributed. MongoDB Atlas M10 handles ~5k writes/sec — sufficient at 50k users assuming ~5% concurrent checkbox activity. |
| Stats aggregation | Cached per-user in Redis for 5 minutes. At 50k users: 50k possible cache keys × ~200 bytes = ~10MB — well within Redis capacity. |
| Redis availability | Graceful degradation implemented — app runs without Redis (loses token blacklisting and caching). Upgrade to Redis Sentinel or AWS ElastiCache for HA. |
| Static assets | Move React build to S3 + CloudFront CDN for global latency reduction. |

### Current Production Setup
- **EC2:** Ubuntu 24.04 (AWS)
- **Process Manager:** PM2 with auto-restart and log rotation
- **Web Server:** Nginx (reverse proxy + static file server)
- **Database:** MongoDB Atlas
- **Cache:** Redis 8.x (localhost)
- **SSL:** Let's Encrypt via Certbot (auto-renews)
- **Domain:** codepath.priyansu.in

---

## 7. API Design

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new student account |
| POST | `/api/auth/login` | — | Login, set httpOnly JWT cookie |
| POST | `/api/auth/logout` | Optional | Blacklist token, clear cookie |
| GET | `/api/auth/me` | Optional | Validate session, return user info |
| GET | `/api/topics` | Optional | All topics (+ user stats if logged in) |
| GET | `/api/topics/:slug` | Optional | Topic + problems (+ isCompleted if logged in) |
| GET | `/api/progress/stats` | **Required** | Per-difficulty completion stats |
| POST | `/api/progress/toggle` | **Required** | Mark problem done/undone |
| GET | `/api/admin/stats` | Admin | Platform-wide user/problem counts |
| POST | `/api/admin/topics` | Admin | Create topic |
| PATCH | `/api/admin/topics/:id` | Admin | Update topic |
| DELETE | `/api/admin/topics/:id` | Admin | Delete topic |
| POST | `/api/admin/problems` | Admin | Create problem |
| PATCH | `/api/admin/problems/:id` | Admin | Update problem |
| DELETE | `/api/admin/problems/:id` | Admin | Delete problem |

---

## 8. Trade-offs

| Decision | Trade-off |
|---|---|
| Public-first model (optionalAuth) | Better discoverability and SEO potential. Trade-off: progress state must be fetched server-side on every topic load for authenticated users (mitigated by TanStack Query caching on the client). |
| httpOnly cookie vs. localStorage for JWT | Cookies are XSS-safe but require CSRF awareness. SameSite=Strict mitigates CSRF for same-origin requests. |
| Optimistic UI for checkbox | Instant feel. Requires rollback on network failure — implemented via TanStack Query `onMutate`/`onError` with snapshot/restore. |
| Redis optional (graceful degradation) | Simplifies deployment — app runs without Redis at the cost of token blacklisting and caching. Acceptable for MVP scale. |
| MongoDB over SQL | Schema flexibility suits content that evolves (new problem fields like companyTags, avgTime). Progress lookups are per-user, never cross-user aggregations, so join performance is not a concern. |
| Denormalized `topicSlug` on problems | Avoids a join on every problem list query. Trade-off: must keep in sync when a topic slug changes (handled in admin service). |

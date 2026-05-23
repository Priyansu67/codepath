# CodePath — Database Schema (LLD)

**Database:** MongoDB (NoSQL Document Store)
**ODM:** Mongoose 8.x

---

## Collections

### 1. `users`

Stores registered student and admin accounts.

```js
{
  _id:          ObjectId,          // Primary key (auto)
  name:         String,            // Display name
  email:        String,            // Unique login identifier
  passwordHash: String,            // bcrypt hash (12 rounds)
  role:         "student"|"admin", // Access control
  createdAt:    Date,
  updatedAt:    Date
}
```

**Indexes:**
- `{ email: 1 }` — unique, used on every login

---

### 2. `topics`

DSA topic categories shown in the sidebar (Arrays, Graphs, DP, etc.).

```js
{
  _id:          ObjectId,
  title:        String,   // "Arrays"
  slug:         String,   // "arrays" — URL identifier
  description:  String,   // Short description for topic card
  icon:         String,   // Reserved field
  order:        Number,   // Display order in sidebar
  problemCount: Number,   // Denormalized count (updated on insert/delete)
  createdAt:    Date,
  updatedAt:    Date
}
```

**Indexes:**
- `{ slug: 1 }` — unique, every topic page load uses this
- `{ order: 1 }` — sidebar sort

---

### 3. `problems`

Individual DSA problems belonging to a topic.

```js
{
  _id:         ObjectId,
  topicId:     ObjectId,           // → topics._id
  topicSlug:   String,             // Denormalized for filter queries
  title:       String,             // "Two Sum"
  slug:        String,             // "two-sum"
  difficulty:  "easy"|"medium"|"hard",
  order:       Number,             // Order within topic
  subtopic:    String,             // "Array (Part 1)" — section header
  companyTags: [String],           // ["Amazon", "Google", ...]
  avgTime:     String,             // "20-30 min"
  resources: {
    youtubeUrl:     String,
    leetcodeUrl:    String,
    codeforcesUrl:  String,
    articleUrl:     String
  },
  tags:        [String],           // ["array", "hash-map"]
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:**
- `{ topicId: 1, order: 1 }` — topic page problem listing
- `{ topicSlug: 1 }` — filter by topic slug
- `{ difficulty: 1 }` — difficulty filter queries
- `{ slug: 1, topicId: 1 }` — unique constraint (no duplicate slugs per topic)

---

### 4. `userprogress`

One document per (user, problem) pair — sparse, only created when a problem is first interacted with.

```js
{
  _id:         ObjectId,
  userId:      ObjectId,   // → users._id
  problemId:   ObjectId,   // → problems._id
  isCompleted: Boolean,    // true = solved
  completedAt: Date|null,  // Timestamp of last completion
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:**
- `{ userId: 1, problemId: 1 }` — unique, primary lookup for toggle operations
- `{ userId: 1 }` — fetch all progress for a user (stats page)
- `{ userId: 1, isCompleted: 1 }` — count completed problems per user

---

## Entity Relationships

```
users (1) ────────────────────────── (N) userprogress
                                           │
problems (1) ──────────────────────── (N) userprogress
    │
    N
    │
topics (1) ───────────────────── (N) problems
```

- A **User** has many **UserProgress** records (one per problem attempted)
- A **Problem** has many **UserProgress** records (one per user who touched it)
- A **Topic** has many **Problems**
- `userprogress` is the join table — upserted on checkbox toggle

---

## Indexing Strategy

### Why these indexes?

| Query | Index Used |
|---|---|
| Login: find user by email | `users.email` (unique) |
| Sidebar: all topics sorted | `topics.order` |
| Topic page: load all problems for a topic | `problems.topicId + order` |
| Progress toggle: upsert user+problem record | `userprogress.userId + problemId` (unique) |
| Stats page: count completed by difficulty | `userprogress.userId + isCompleted` |
| Admin: list all problems | `problems.topicSlug` |

### At 10k–50k users

The most write-intensive path is `userprogress` (every checkbox click). With 50k users each solving ~50 problems, the collection reaches ~2.5M documents. The compound `{ userId, problemId }` unique index keeps upsert latency under 5ms at this scale on MongoDB Atlas M10.

Progress stats are aggregated per user (never across all users), so aggregation pipelines stay bounded to a single user's records (~200 docs max).

---

## Public vs. Authenticated Queries

```
Unauthenticated user visits /topics/arrays
  ↓
db.problems.find({ topicId })  — no UserProgress join
  → returns problems, isCompleted absent (treated as false in UI)

Authenticated user visits same page
  ↓
db.problems.find({ topicId })  — then:
db.userprogress.find({ userId, problemId: { $in: problemIds } })
  → merge: each problem gets isCompleted from their progress record
  → student resumes exactly where they left off
```

---

## Data Flow Example — Progress Toggle

```
User checks "Two Sum" as solved
  ↓
POST /api/progress/toggle
  Body: { problemId: "664abc...", isCompleted: true }
  Cookie: JWT (userId extracted by middleware)
  ↓
db.userprogress.findOneAndUpdate(
  { userId: "user_id", problemId: "664abc..." },
  { $set: { isCompleted: true, completedAt: new Date() } },
  { upsert: true, new: true }
)
  ↓
redis.del("stats:user_id")   ← invalidate cached stats
  ↓
Response: 200 OK
```

---

## Seed Data

The database is seeded with:
- **14 topics** (Arrays → Miscellaneous)
- **193 problems** sourced from the ApnaCollege DSA Sheet
- **2 user accounts:**
  - `demo@codepath.com` / `Demo@1234` (student role)
  - `admin@codepath.com` / `Admin@1234` (admin role)

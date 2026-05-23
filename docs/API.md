# API Reference — CodePath

Base URL: `/api/v1`

All responses follow this shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## Auth

| Method | Path              | Auth   | Body                        | Response                        |
|--------|-------------------|--------|-----------------------------|----------------------------------|
| POST   | `/auth/signup`    | —      | `{name, email, password}`   | `{user, accessToken}` + cookie  |
| POST   | `/auth/login`     | —      | `{email, password}`         | `{user, accessToken}` + cookie  |
| POST   | `/auth/refresh`   | Cookie | —                           | `{user, accessToken}` + cookie  |
| POST   | `/auth/logout`    | Bearer | —                           | `204`                           |
| GET    | `/auth/me`        | Bearer | —                           | `{user}`                        |

Password rules: min 8 chars, at least 1 uppercase, at least 1 digit.

---

## Topics

| Method | Path             | Auth   | Response                             |
|--------|------------------|--------|--------------------------------------|
| GET    | `/topics`        | Bearer | `{topics[]}` with per-topic stats    |
| GET    | `/topics/:slug`  | Bearer | `{topic, problems[], stats}`         |

---

## Problems

| Method | Path              | Auth   | Query                        | Response            |
|--------|-------------------|--------|------------------------------|---------------------|
| GET    | `/problems`       | Bearer | `?difficulty=&topicId=&page=`| `{problems[], total}`|
| GET    | `/problems/:id`   | Bearer | —                            | `{problem}`         |

---

## Progress

| Method | Path               | Auth   | Body                          | Response                       |
|--------|--------------------|--------|-------------------------------|--------------------------------|
| GET    | `/progress/me`     | Bearer | —                             | `{progress[]}`                 |
| GET    | `/progress/stats`  | Bearer | —                             | `{overall, byDifficulty, perTopic}` |
| POST   | `/progress/toggle` | Bearer | `{problemId, isCompleted}`    | `{progress}`                   |

### Stats response shape
```json
{
  "overall": { "total": 55, "completed": 12, "percentage": 22 },
  "byDifficulty": {
    "easy":   { "total": 18, "completed": 8 },
    "medium": { "total": 28, "completed": 4 },
    "hard":   { "total": 9,  "completed": 0 }
  },
  "perTopic": [
    { "topicId": "...", "slug": "arrays", "title": "Arrays & Hashing", "icon": "⬛", "total": 7, "completed": 3, "percentage": 43 }
  ]
}
```

---

## Error Codes

| Code                  | HTTP | Meaning                            |
|-----------------------|------|------------------------------------|
| `VALIDATION_ERROR`    | 400  | Request body failed schema check   |
| `INVALID_TOKEN`       | 401  | JWT missing, malformed, or expired |
| `UNAUTHORIZED`        | 401  | Not authenticated                  |
| `INVALID_CREDENTIALS` | 401  | Wrong email or password            |
| `TOKEN_REVOKED`       | 401  | Refresh token was blacklisted      |
| `FORBIDDEN`           | 403  | Authenticated but not authorised   |
| `NOT_FOUND`           | 404  | Resource does not exist            |
| `EMAIL_TAKEN`         | 409  | Email already registered           |
| `DUPLICATE_KEY`       | 409  | Unique constraint violation        |
| `RATE_LIMITED`        | 429  | Too many requests                  |
| `INTERNAL_ERROR`      | 500  | Unexpected server error            |

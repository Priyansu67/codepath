# CodePath — MERN Application

A full-stack DSA practice tracker built with the MERN stack and deployed on AWS.

## Live Demo

**https://codepath.priyansu.in/**

**Demo credentials:**
- Email: `demo@codepath.com`
- Password: `Demo@1234`

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Frontend   | React 18 + Vite + TypeScript + Tailwind  |
| State      | Zustand + TanStack Query                 |
| Backend    | Node.js 20 + Express + TypeScript        |
| Database   | MongoDB Atlas (Mongoose)                 |
| Auth       | JWT (access + refresh) + bcrypt          |
| Cache      | Redis (optional, graceful fallback)      |
| Deploy     | AWS S3 + CloudFront + EC2 + ALB          |
| CI/CD      | GitHub Actions                           |

---

## Local Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (optional)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
npm run seed        # populate topics + problems
npm run dev         # starts on http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable            | Description                              |
|---------------------|------------------------------------------|
| `PORT`              | Server port (default 4000)               |
| `NODE_ENV`          | `development` or `production`            |
| `MONGODB_URI`       | MongoDB connection string                |
| `JWT_ACCESS_SECRET` | Secret for access tokens (32+ chars)     |
| `JWT_REFRESH_SECRET`| Secret for refresh tokens (32+ chars)    |
| `REDIS_URL`         | Redis URL (optional)                     |
| `CLIENT_URL`        | Frontend origin for CORS                 |

### Frontend (`frontend/.env`)

| Variable       | Description                   |
|----------------|-------------------------------|
| `VITE_API_URL` | Backend API base URL          |

---

## API Documentation

See [docs/API.md](docs/API.md)

---

## Deployment

### Frontend → S3 + CloudFront
```bash
cd frontend && npm run build
aws s3 sync dist s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

### Backend → EC2 + PM2
```bash
# On EC2
cd /var/www/codepath/backend
npm ci --omit=dev
npm run build
pm2 start ecosystem.config.js --env production
```

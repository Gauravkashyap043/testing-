# Harbor

Next.js + MongoDB Atlas auth app: two-step signup (email → password), login, user dashboard, and env-password admin user list.

## Setup

1. Copy env file and fill in values:

```bash
cp .env.example .env.local
```

- `MONGODB_URI` — Atlas connection string
- `SESSION_SECRET` — long random string (cookie signing)
- `ADMIN_PASSWORD` — shared password for `/admin/login`

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/signup` | Enter email (saved to MongoDB) |
| `/signup/password` | Set + hash password |
| `/login` | Sign in |
| `/dashboard` | User home |
| `/admin/login` | Admin gate |
| `/admin` | List all emails/users |

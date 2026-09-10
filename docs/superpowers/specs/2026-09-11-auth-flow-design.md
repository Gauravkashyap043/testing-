# Auth Flow Design — Next.js + MongoDB

**Date:** 2026-09-11  
**Status:** Approved (user: approach A, “do it”)

## Goal

Two-step sign-up (email → password), separate login, user dashboard, and a secure admin area (shared env password) to list all users.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- MongoDB Atlas via Mongoose
- bcryptjs for password hashing
- jose for signed HTTP-only session cookies

## Flows

### Sign-up
1. `/signup` — collect email → upsert user by email (no password yet) → set short-lived `signup_email` cookie → redirect `/signup/password`
2. `/signup/password` — collect password → bcrypt hash → save on user → clear signup cookie → set `user_session` → `/dashboard`

### Login
- `/login` — email + password on one page → verify hash → set `user_session` → `/dashboard`

### User dashboard
- `/dashboard` — requires `user_session`; shows signed-in email and account status (complete vs incomplete signup)

### Admin
- `/admin/login` — single password checked against `ADMIN_PASSWORD`
- On success → `admin_session` cookie → `/admin` lists all users (email, createdAt, whether password is set)
- Middleware protects `/admin` (except login)

## Data model

```ts
User {
  email: string;        // unique, lowercase
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Env

- `MONGODB_URI` — Atlas connection string
- `SESSION_SECRET` — signing key for cookies
- `ADMIN_PASSWORD` — shared admin gate password

## Out of scope

Email verification, password reset, OAuth, multiple admins, roles in DB.

# Secure Notes API

Express + TypeScript + MongoDB (Mongoose) backend for a note-taking app with JWT auth and user/admin roles.

## Setup

```bash
npm install
cp .env.example .env      # then set the JWT secrets and MONGODB_URI
npm run seed:admin        # creates the admin account from ADMIN_* in .env
npm run dev
```

API base URL: `http://localhost:4000/api/v1`

## Structure

```
src/
  config/          env validation, db connection
  common/          middlewares (auth, roles, validation, errors), utils
  modules/
    auth/          register, login
    users/         profile, admin user management, group-by-interest aggregation
    notes/         notes CRUD
    posts/         public posts, posts-by-user $lookup aggregation
  scripts/         seed-admin
```

Each module has its own `model`, `validation`, `service`, `controller` and `routes` file.

## Authentication

- `register` / `login` return a short-lived **access token** (15 min) and a **refresh token** (7 days)
  in the response body. The refresh token is also set as an `httpOnly` cookie scoped to `/api/v1/auth`.
- `POST /auth/refresh` and `POST /auth/logout` read the refresh token from the cookie, or from
  `{ "refreshToken": "..." }` in the body for clients that don't use cookies (Postman, mobile).
- Send the access token as `Authorization: Bearer <token>`. When it expires, call `POST /auth/refresh`
  (with credentials) to get a new one.
- Each user has a `tokenVersion` that is stored in both tokens. Logout, a password change or an admin
  resetting the password bumps it, which invalidates every token issued before.
- Login and register are rate limited to 10 requests per 15 minutes per IP.

## Endpoints

All routes except `/health` and the public auth routes need `Authorization: Bearer <access token>`.
List endpoints accept `?page=1&limit=10` (max 100).

| Method | Route | Access |
| --- | --- | --- |
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | refresh cookie |
| POST | `/auth/logout` | refresh cookie |
| PATCH | `/auth/password` | user |
| GET / PATCH | `/users/me` | user |
| GET / POST | `/users` | admin |
| GET / PATCH / DELETE | `/users/:id` | admin |
| GET | `/users/interests?interest=` | admin |
| GET / POST | `/notes` | user (own notes) |
| GET | `/notes/all?owner=` | admin |
| GET | `/notes/:id` | owner or admin |
| PATCH / DELETE | `/notes/:id` | owner |
| GET / POST | `/posts` | user |
| GET | `/posts/user/:userId` | user |
| GET / PATCH | `/posts/:id` | user (PATCH: author) |
| DELETE | `/posts/:id` | author or admin |

## Indexes

| Collection | Index | Used by |
| --- | --- | --- |
| users | `{ email: 1 }` unique | login lookup, unique email |
| users | `{ interests: 1 }` | `$match` stage of the group-by-interest aggregation |
| notes | `{ owner: 1, _id: -1 }` | listing a user's notes (filter + sort), count, admin `?owner=` filter, cascade delete |
| posts | `{ author: 1, _id: -1 }` | `$lookup` sub-pipeline (match on author + sort), cascade delete |

Lists are sorted by `_id` (ObjectIds increase with insert time), so the "all users", "all notes" and "all posts" lists and every get-by-id use the built-in `_id` index without needing an extra one.

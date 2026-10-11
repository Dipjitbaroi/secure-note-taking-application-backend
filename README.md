# Secure Notes — Backend API

**Secure Notes** is a note-taking platform with secure authentication and role-based access control.
Users write private notes and public posts; admins manage users, can read everyone's notes and see
users grouped by interest.

The project is split into two repositories:

- **Backend** (this repo) — REST API with Express, TypeScript, MongoDB/Mongoose and JWT. The focus is on
  a minimal indexing strategy and MongoDB aggregation pipelines.
- **[Frontend](https://github.com/Dipjitbaroi/secure-note-taking-application-frontend)** — React +
  TypeScript app built with Vite, Tailwind CSS and shadcn/ui.

## Live

| | URL |
| --- | --- |
| Web app | https://secure-note-taking-application-fron-five.vercel.app |
| API base URL | https://secure-note-taking-application-back.vercel.app/api/v1 |
| Health check | https://secure-note-taking-application-back.vercel.app/api/v1/health |

## Screenshots

| | |
| --- | --- |
| **My notes**<br>![My notes](https://raw.githubusercontent.com/Dipjitbaroi/secure-note-taking-application-frontend/main/docs/screenshots/my-notes.png) | **Posts by one user** (`$lookup`)<br>![User posts](https://raw.githubusercontent.com/Dipjitbaroi/secure-note-taking-application-frontend/main/docs/screenshots/user-posts.png) |
| **Admin – users**<br>![Admin users](https://raw.githubusercontent.com/Dipjitbaroi/secure-note-taking-application-frontend/main/docs/screenshots/admin-users.png) | **Users by interest** (group-by aggregation)<br>![Interests](https://raw.githubusercontent.com/Dipjitbaroi/secure-note-taking-application-frontend/main/docs/screenshots/admin-interests.png) |

More screenshots are in the [frontend repo](https://github.com/Dipjitbaroi/secure-note-taking-application-frontend#screenshots).

## Features

- **Roles** — `user`: create, update, delete and list own notes. `admin`: everything a user can do,
  plus add / update / remove / list users and view everyone's notes.
- **Auth** — JWT access token (15 min) + refresh token (7 days), bcrypt password hashing, token revocation
  on logout / password change, rate-limited login and register.
- **Pagination** on every list endpoint (`?page=1&limit=10`, max 100).
- **Indexes** defined with `schema.index()` — only the ones the queries need (see below).
- **Aggregations**
  - Users grouped by interest — a single `collection.aggregate()` call, paginated with `$facet`.
  - All posts of a user — a single pipeline with `$lookup` from `users` into `posts`.

## Tech stack

Node.js, Express 5, TypeScript, MongoDB + Mongoose, jsonwebtoken, bcryptjs, Zod, helmet,
express-rate-limit, tsup (build), Vercel (hosting), MongoDB Atlas (database).

## Getting started

Requirements: Node.js 20+ and MongoDB (local or Atlas).

```bash
git clone https://github.com/Dipjitbaroi/secure-note-taking-application-backend.git
cd secure-note-taking-application-backend
npm install
cp .env.example .env      # set MONGODB_URI and the two JWT secrets
npm run seed:admin        # creates the admin account from ADMIN_* in .env
npm run dev               # http://localhost:4000/api/v1
```

Generate JWT secrets with `openssl rand -hex 32`.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `MONGODB_URI` | — | MongoDB connection string, including the database name |
| `JWT_ACCESS_SECRET` | — | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | — | Secret for refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | Refresh token lifetime in days |
| `PORT` | `4000` | Port for the local server |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origins, comma separated |
| `COOKIE_SAME_SITE` | `strict` | SameSite of the refresh cookie (`none` if the frontend is on another site) |
| `NODE_ENV` | `development` | `production` hides stack traces and marks the cookie `Secure` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | — | Used only by `npm run seed:admin` |

### Scripts

| Command | |
| --- | --- |
| `npm run dev` | Start with hot reload (tsx) |
| `npm run build` | Bundle with tsup to `dist/` |
| `npm start` | Run the built server |
| `npm run typecheck` | Type-check with `tsc` |
| `npm run seed:admin` | Create the admin account |
| `npm run deploy` | Build locally and deploy the prebuilt output to Vercel |

## Project structure

```
src/
  config/          env validation, db connection
  common/          middlewares (auth, roles, validation, errors, rate limit), utils
  modules/
    auth/          register, login, refresh, logout, change password
    users/         profile, admin user management, group-by-interest aggregation
    notes/         notes CRUD
    posts/         public posts, posts-by-user $lookup aggregation
  scripts/         seed-admin
api/index.js       Vercel function entry (loads the tsup build)
```

Each module has its own `model`, `validation`, `service`, `controller` and `routes` file.

## Authentication

- `register` / `login` return a short-lived **access token** (15 min) and a **refresh token** (7 days)
  in the response body. The refresh token is also set as an `httpOnly` cookie scoped to `/api/v1/auth`.
- `POST /auth/refresh` and `POST /auth/logout` read the refresh token from the cookie, or from
  `{ "refreshToken": "..." }` in the body for clients that don't use cookies (Postman, mobile, another domain).
- Send the access token as `Authorization: Bearer <token>`.
- Each user has a `tokenVersion` that is stored in both tokens. Logout, a password change or an admin
  resetting the password bumps it, which invalidates every token issued before.
- Login and register are rate limited to 10 requests per 15 minutes per IP.

## Endpoints

All routes are under `/api/v1`. Everything except `/health` and the public auth routes needs
`Authorization: Bearer <access token>`.

| Method | Route | Access |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | refresh token |
| POST | `/auth/logout` | refresh token |
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

Lists are sorted by `_id` (ObjectIds increase with insert time), so the "all users", "all notes" and
"all posts" lists and every get-by-id use the built-in `_id` index without needing an extra one.

## Deployment

Hosted on Vercel with MongoDB Atlas. `vercel.json` runs `npm run build` (tsup) and routes every request
to `api/index.js`, which exports the Express app from `dist/server.js`. The database connection is opened
on the first request and reused while the function stays warm.

```bash
vercel env add MONGODB_URI production
openssl rand -hex 32 | vercel env add JWT_ACCESS_SECRET production
openssl rand -hex 32 | vercel env add JWT_REFRESH_SECRET production
npm run deploy
```

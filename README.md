# Gradly

Gradly is a production-oriented College Discovery Platform MVP inspired by Careers360 and CollegeDunia. It includes a Next.js 14 frontend, an Express + Prisma backend, JWT cookie auth, compare flows, saved colleges, and seeded Indian college data.

## Live URLs

- Frontend: not deployed from this workspace session
- Backend: not deployed from this workspace session

This repository is prepared for Git-based deployment. You still need your own PostgreSQL database, Auth0 app, and hosting accounts before going live.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, React Query, Zustand, React Hook Form, Zod, Framer Motion
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt
- Database target: PostgreSQL via Neon or Supabase in production

## Architecture

```text
┌──────────────────────┐        HTTPS        ┌──────────────────────────┐
│ Next.js Frontend     │  ─────────────────► │ Express API              │
│ /frontend            │                     │ /backend/src             │
│                      │ ◄─────────────────  │                          │
│ - App Router pages   │   JSON + cookies    │ - Auth routes            │
│ - React Query        │                     │ - Colleges routes        │
│ - Zustand stores     │                     │ - Saved routes           │
│ - Auth modal         │                     │ - Zod validation         │
└──────────────────────┘                     └─────────────┬────────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────────┐
                                                │ PostgreSQL           │
                                                │ Prisma schema        │
                                                │ seed.ts (40 colleges)│
                                                └──────────────────────┘
```

## Project Structure

```text
/frontend
  /app
  /components
  /lib
  /providers
  /store
  /types

/backend
  /src
    /lib
    /middleware
    /routes
    /utils
  /prisma
    schema.prisma
    seed.ts
    /migrations
```

## Features

- College listing page with debounced search, URL-synced filters, pagination, skeleton loading, and empty states
- College detail page with dynamic metadata, breadcrumb, sticky tabbed sections, courses, placements, and reviews
- Compare tray persisted in Zustand + localStorage with up to three colleges and a highlight-best comparison table
- Auth flow with register, login by email or phone number, Google/Auth0 signup, logout, `me`, and cookie-based JWT session management
- Saved colleges with optimistic bookmark toggles and protected saved page behavior

## Environment Variables

### Backend

Create `backend/.env` using `backend/.env.example`.

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
JWT_SECRET="replace-with-a-strong-secret"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
FRONTEND_ORIGIN="http://localhost:3000"
NODE_ENV="development"
ISSUER_BASE_URL="https://your-tenant.us.auth0.com"
CLIENT_ID="your-auth0-client-id"
CLIENT_SECRET="your-auth0-client-secret"
SECRET="replace-with-a-long-random-auth0-session-secret"
BASE_URL="http://localhost:4000"
AUTH0_GOOGLE_CONNECTION="google-oauth2"
AUTH0_HTTP_TIMEOUT=15000
AUTH0_GOOGLE_PROMPT="select_account"
```

If you use Auth0 locally, add these exact URLs in the Auth0 application settings:

- Allowed Callback URLs: `http://localhost:4000/api/auth/auth0/callback`
- Allowed Logout URLs: `http://localhost:3000`
- Allowed Web Origins: `http://localhost:3000`

If you want the "Continue with Google" button to go straight to Google, make sure the Auth0 Google social connection is enabled and its connection name matches `AUTH0_GOOGLE_CONNECTION`.

### Frontend

Create `frontend/.env.local` using `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Supabase helpers are included here:

- [frontend/lib/supabase/client.ts](/c:/Users/Abhishek/Gradly/frontend/lib/supabase/client.ts)
- [frontend/lib/supabase/server.ts](/c:/Users/Abhishek/Gradly/frontend/lib/supabase/server.ts)
- [frontend/lib/supabase/middleware.ts](/c:/Users/Abhishek/Gradly/frontend/lib/supabase/middleware.ts)
- [frontend/middleware.ts](/c:/Users/Abhishek/Gradly/frontend/middleware.ts)

## Local Setup

1. Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Provision PostgreSQL.

- Recommended for production: create a Neon or Supabase Postgres instance and copy its connection string into `backend/.env`.
- For local development: point `DATABASE_URL` at any reachable Postgres instance.

3. Generate Prisma client and run migrations:

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
```

4. Seed the database:

```bash
npx ts-node backend/prisma/seed.ts
```

Or from the backend directory:

```bash
npx ts-node prisma/seed.ts
```

5. Start the apps:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend runs on `http://localhost:3000` and backend runs on `http://localhost:4000`.

## Build Commands

```bash
npm run build:backend
npm run build:frontend
```

## API Summary

### Public

- `GET /health`
- `GET /api/colleges`
- `GET /api/colleges/featured`
- `GET /api/colleges/compare?ids=1,2,3`
- `GET /api/colleges/:idOrSlug`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected

- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/saved`
- `POST /api/saved/:id`
- `DELETE /api/saved/:id`

## Deployment

This repo is a two-app setup:

- `frontend/`: Next.js 14 app
- `backend/`: Express + Prisma API

Deploy them as two separate projects from the same GitHub repository.

### Vercel setup

Create two Vercel projects from the same repo:

1. Frontend project
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output setting: leave the Vercel default for Next.js

2. Backend project
- Root Directory: `backend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Start Command: `npm run start:prod`

Backend environment variables for Vercel:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
JWT_SECRET="replace-with-a-strong-secret"
PORT=4000
CORS_ORIGIN="https://your-frontend-domain.vercel.app"
FRONTEND_ORIGIN="https://your-frontend-domain.vercel.app"
NODE_ENV="production"
ISSUER_BASE_URL="https://your-auth0-tenant.us.auth0.com"
CLIENT_ID="your-auth0-client-id"
CLIENT_SECRET="your-auth0-client-secret"
SECRET="replace-with-a-long-random-auth0-session-secret"
BASE_URL="https://your-backend-domain.vercel.app"
AUTH0_GOOGLE_CONNECTION="google-oauth2"
AUTH0_HTTP_TIMEOUT=15000
AUTH0_GOOGLE_PROMPT="select_account"
```

Frontend environment variables for Vercel:

```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.vercel.app"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

### Netlify setup

Netlify is ready for the frontend app in `frontend/`.

Frontend project settings on Netlify:

1. Base directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `.next`

Frontend environment variables for Netlify:

```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.vercel.app"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Use Vercel for the backend in this repo. The backend is an Express server with Prisma and PostgreSQL, which fits the current Vercel deployment path in this codebase more directly than a Netlify migration.

### Production checklist

1. Deploy the backend first and verify `GET /health` returns `{ "status": "ok" }`.
2. Run `prisma migrate deploy` as part of backend startup.
3. Seed production data once using `npx ts-node prisma/seed.ts` from `backend/` against the production database.
4. Set the frontend `NEXT_PUBLIC_API_URL` to the deployed backend URL.
5. Update Auth0 Allowed Callback URLs to include `https://your-backend-domain.vercel.app/api/auth/auth0/callback`.
6. Update Auth0 Allowed Logout URLs and Allowed Web Origins to include your deployed frontend domain.
7. Confirm `/`, `/colleges`, `/compare`, `/saved`, and `/college/[slug]` load without runtime errors.

## Verification Completed In This Workspace

- Backend TypeScript build: passed
- Frontend production build: passed after removing the remote Google font dependency
- Initial Prisma migration SQL generated at `backend/prisma/migrations/20260430_init/migration.sql`

## Verification Blocked In This Workspace

- Real `prisma migrate dev` execution against PostgreSQL
- Real seed execution against PostgreSQL
- Live deployment to Vercel + Netlify
- Full authenticated smoke test against running services

Those steps are blocked here because no GitHub remote, no GitHub CLI session, no reachable production PostgreSQL instance, and no deployment credentials were available during the session.

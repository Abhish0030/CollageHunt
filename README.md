# CollageHunt

Smart college discovery and comparison platform built with Next.js, Express, Prisma, and PostgreSQL.

[Live App](https://gradly-doytmdxgc-abhish0030s-projects.vercel.app/)

![CollageHunt Banner](https://raw.githubusercontent.com/Abhish0030/Gradly/main/frontend/public/readme-banner.png)

## Overview

CollageHunt helps students explore, compare, and shortlist colleges with a clean browsing experience and structured college data.

## Features

- Search colleges by name, city, or state
- Compare multiple colleges side by side
- Save colleges to your profile
- View dynamic college detail pages
- Use JWT-based authentication
- Browse a responsive UI built for desktop and mobile

## Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Framer Motion
- React Hook Form
- Zod

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Project Structure

```text
frontend/
  app/
  components/
  lib/
  providers/
  store/
  types/

backend/
  prisma/
  scripts/
  src/
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abhish0030/Gradly.git
cd CollageHunt
```

### 2. Install dependencies

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Set up environment variables

Create these files before running the app.

`backend/.env`

```env
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
JWT_SECRET=your_secret
BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
FRONTEND_ORIGIN=http://localhost:3000
```

`frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Run the app

```bash
npm run dev:backend
npm run dev:frontend
```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

## License

This project is licensed under the MIT License.

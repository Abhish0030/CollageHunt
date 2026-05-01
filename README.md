Got it — you want your **Gradly README** upgraded to look clean, modern, and attractive like your **UniLink README** (with banner, sections, polished structure).

Here’s your **updated README.md** (ready to copy-paste) 👇

---

# 🎓 Gradly

**Smart College Discovery & Comparison Platform**

> *Built with Next.js 14, Express, Prisma & PostgreSQL*

**🌐 Live App:** *(Add your deployed link here)*

<img src="frontend/public/gradly-banner.png" alt="Gradly Banner" width="100%" />

---

## 📌 What is Gradly?

Gradly is a modern **college discovery platform** designed to help students explore, compare, and save colleges across India.

It simplifies the decision-making process by providing structured college data, comparison tools, and personalized features like saved colleges and filters.

Gradly is inspired by platforms like Careers360 and CollegeDunia, but built as a **fast, scalable, and developer-focused MVP**.

---

## 🏗️ Architecture

```bash
Frontend (Next.js 14 + TypeScript + Tailwind)
        │
        ▼
Backend (Node.js + Express + Prisma)
        │
        ▼
PostgreSQL Database
```

---

## ✨ Features

- 🔍 Search colleges by name, city, or state
- 📊 Compare multiple colleges side by side
- ❤️ Save colleges to your profile
- 🔐 JWT-based authentication system
- 🧾 Dynamic college detail pages
- ⚡ Optimized frontend with skeleton loaders and smooth UX
- 📱 Responsive and modern UI

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Framer Motion
- React Hook Form + Zod

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

---

## 📂 Folder Structure

```bash
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

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abhish0030/Gradly.git
cd Gradly
```

### 2. Install dependencies

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Setup environment variables

Create your `.env` files:

#### backend/.env
```env
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
JWT_SECRET=your_secret
BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
FRONTEND_ORIGIN=http://localhost:3000
```

#### frontend/.env.local
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

---

## 📦 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase / PostgreSQL

---

## 📜 License

This project is licensed under the MIT License.

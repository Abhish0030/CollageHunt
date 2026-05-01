Got it — you want your **Gradly README** upgraded to look clean, modern, and attractive like your **UniLink README** (with banner, sections, polished structure).

Here’s your **updated README.md** (ready to copy-paste) 👇

---

# 🎓 Gradly

**Smart College Discovery & Comparison Platform**

> *Built with Next.js 14, Express, Prisma & PostgreSQL*

**🌐 Live App:** *(Add your deployed link here)*

<img src="docs/images/gradly-banner.png" alt="Gradly Banner" width="100%" />

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
REST API (Node.js + Express + Prisma)
        │
        ▼
PostgreSQL Database (Supabase / Neon)
```

---

## ✨ Key Features

### 🔍 College Discovery

* Browse colleges with filters & search
* Pagination & optimized queries
* Dynamic college detail pages

### ⚖️ Compare Colleges

* Compare up to 3 colleges
* Highlight best features
* Persistent compare tray

### ❤️ Saved Colleges

* Bookmark colleges
* Optimistic UI updates
* Protected routes

### 🔐 Authentication

* JWT Cookie-based Auth
* Login / Register
* Google/Auth0 integration

### ⚡ Performance & UX

* Server-side rendering (Next.js)
* Skeleton loading
* Smooth animations (Framer Motion)

---

## 🛠️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | Next.js 14, TypeScript |
| Styling    | Tailwind CSS           |
| State Mgmt | Zustand                |
| Data Fetch | React Query            |
| Backend    | Node.js, Express       |
| Database   | PostgreSQL             |
| ORM        | Prisma                 |
| Auth       | JWT + Auth0            |
| Deployment | Vercel + Render        |

---

## 🚀 Getting Started

### 📦 Prerequisites

* Node.js
* PostgreSQL (Supabase / Neon recommended)
* Auth0 account

---

## 💻 Local Development

```bash
# Install dependencies
npm install
npm --prefix backend install
npm --prefix frontend install

# Run backend
npm run dev:backend

# Run frontend
npm run dev:frontend
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
DATABASE_URL=your_postgres_url
DIRECT_URL=your_direct_url
JWT_SECRET=your_secret
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

ISSUER_BASE_URL=your_auth0_domain
CLIENT_ID=your_client_id
CLIENT_SECRET=your_secret
BASE_URL=http://localhost:4000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
```

---

## 🌐 Deployment

### Frontend:

* Vercel

### Backend:

* Render

### Database:

* Supabase / Neon

---

## 📡 API Endpoints

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | /api/colleges         | Get all colleges   |
| GET    | /api/colleges/:id     | Get single college |
| GET    | /api/colleges/compare | Compare colleges   |
| POST   | /api/auth/register    | Register           |
| POST   | /api/auth/login       | Login              |

---

## 🎯 Project Goals

* Simplify college selection
* Provide structured & reliable data
* Enable smart comparisons
* Build scalable EdTech platform

---

## 📷 Screenshots

### 🏠 Homepage

<img src="docs/images/home.png" width="100%" />

### 🔍 College Listing

<img src="docs/images/listing.png" width="100%" />

### ⚖️ Compare Page

<img src="docs/images/compare.png" width="100%" />

*(Add your screenshots in `/docs/images` folder)*

---

## 👨‍💻 Author

**Abhishek Amar**
GitHub: [https://github.com/Abhish0030](https://github.com/Abhish0030)

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub.

---

## 📌 Future Improvements

* AI-based college recommendation
* Reviews & ratings system
* Admission alerts
* Mobile app
* Advanced analytics dashboard

---

## 🚀 Tagline

**Gradly — Discover. Compare. Decide.**

---

## 🔥 What I Improved (so you understand)

* Same clean structure as UniLink
* Strong headings + icons
* Banner support
* Better readability for recruiters
* Added screenshots section (very important)

---

If you want, I can also:

* 🎨 **Design a banner for Gradly (like UniLink)**
* 📸 Tell you exactly **how to add screenshots in GitHub README**
* 🧠 Help you make this **ATS-friendly for portfolio/interview**

Just tell me 👍

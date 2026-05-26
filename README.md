# CollageHunt 🎓
### Smart College Discovery & Decision Platform for Indian Students

CollageHunt is a modern full-stack college discovery and decision platform built to help Indian students **discover, compare, shortlist, and confidently choose the right college** based on placements, fees, rankings, admission probability, and personalized priorities.

Unlike traditional education portals that overwhelm users with scattered data, CollageHunt focuses on the **decision-making layer** — transforming raw information into actionable insights.

## 🌐 Live Demo

**Frontend:** [https://your-vercel-url.vercel.app ](https://gradly-taupe.vercel.app/) 
**Backend API:** [https://your-render-api.onrender.com](https://gradly-p849.onrender.com)  


![CollageHunt Banner](https://raw.githubusercontent.com/Abhish0030/Gradly/main/frontend/public/readme-banner.png)



---

## Problem Statement

Students already have access to rankings, fee structures, placement reports, and admission cutoffs.

The real problem is **decision paralysis**, not data shortage.

CollageHunt solves this by providing:

- Smart discovery
- Visual comparison
- Personalized recommendations
- Admission prediction
- Review-driven trust signals
- Career decision support

---

## ✨ Features

## College Discovery
Fast and intuitive search experience with:

- Instant debounced search
- Multi-filter support
- City-based filtering
- Stream filtering
- Fee-based filtering
- Ownership filtering
- Ranking sorting
- Responsive college cards
- Skeleton loaders
- SEO-friendly rendering

---

## Smart Comparison Engine

Visual comparison experience for better decision-making:

Compare by:

- Fees
- Average placement package
- Maximum package
- NIRF ranking
- Location
- Stream offerings

Features:

- Dynamic winner highlighting
- Weighted scoring engine
- Difference-only mode
- Real-time score updates
- Compare tray
- Shareable comparison URLs

---

## College Detail Pages

Detailed college intelligence pages including:

- College overview
- Courses & fee structure
- Placement analytics
- Top recruiters
- Admission details
- Student reviews
- Accreditation information
- Ranking highlights
- Save / shortlist actions
- Apply CTA

Visual insights powered by charts for better understanding.

---

## Personalized Decision Engine

Students can prioritize what matters most:

- Placements
- Fees
- Location
- Academics

CollageHunt generates personalized recommendations using weighted scoring logic.

---

## Admission Predictor

Estimate admission probability using:

- JEE percentile
- CUET score
- Category
- Historical cutoffs

Prediction outputs:

- High probability
- Medium probability
- Low probability

---

## Student Review System

Trust and transparency layer:

- Review submission
- Moderation workflow
- Rating aggregation
- Faculty ratings
- Infrastructure ratings
- Placement feedback

---

## Authentication

Secure user authentication using:

- Auth0
- Session-based auth
- Protected routes
- Persistent sessions

---

# 🛠 Tech Stack

## Frontend
- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Recharts

---

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Auth0

---

## Deployment
- Vercel (Frontend)
- Render (Backend)
- Managed PostgreSQL

---

# 🏗 Architecture

```text
Frontend (Next.js)
      ↓
API Layer
      ↓
Backend (Express + Prisma)
      ↓
PostgreSQL Database
```

Architecture principles:

- scalable design
- separation of concerns
- API-first backend
- strongly typed architecture
- production deployment readiness

---

# 📁 Project Structure

```bash
collagehunt/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── lib/
│   │   └── utils/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── scripts/
│
└── README.md
```

---

# 🔌 API Endpoints

## Colleges
```http
GET /api/colleges
GET /api/colleges/:id
GET /api/colleges/compare?ids=1,2,3
```

## Decision Engine
```http
POST /api/score
GET /api/predictor/:college_id
```

## Reviews
```http
POST /api/colleges/:id/reviews
GET /api/colleges/:id/reviews
POST /api/admin/reviews/:id/approve
POST /api/admin/reviews/:id/reject
```

## Shortlist
```http
POST /api/shortlist
GET /api/shortlist/:session_id
```

## Authentication
```http
GET /api/auth/login
GET /api/auth/logout
GET /api/auth/me
```

---

# 🗄 Database Schema

Core entities:

- College
- CourseFee
- PlacementStat
- AdmissionCutoff
- Review
- User
- Shortlist

Database goals:

- normalization
- fast querying
- maintainability
- extensibility

---

# ⚡ Performance Optimizations

Implemented optimizations:

- debounced search
- optimized Prisma queries
- indexed database queries
- lazy loading
- reduced API payloads
- skeleton loading
- optimized rendering
- caching where applicable
- responsive performance tuning

---

# 🔒 Security

Security measures:

- Auth0 authentication
- secure cookie sessions
- protected admin endpoints
- Zod validation
- Prisma SQL injection protection
- environment variable isolation
- CORS restrictions
- sanitized API errors

---

# 🚀 Local Development Setup

## Clone Repository

```bash
git clone https://github.com/Abhish0030/CollageHunt.git
cd CollageHunt
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
DATABASE_URL=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
FRONTEND_URL=
PORT=4000
JWT_SECRET=
SESSION_SECRET=
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed database:

```bash
npm run seed
```

Start backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

---

# ☁ Production Deployment

## Frontend (Vercel)

Environment variables:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

Deploy:

```bash
vercel --prod
```

---

## Backend (Render)

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npx prisma migrate deploy && npm start
```

Required environment variables:

```env
DATABASE_URL
AUTH0_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_SECRET
FRONTEND_URL
PORT
SESSION_SECRET
JWT_SECRET
```

---

# 🎯 Engineering Highlights

CollageHunt demonstrates:

- modern full-stack engineering
- scalable backend architecture
- production deployment practices
- secure authentication
- relational database design
- API contract design
- responsive frontend engineering
- performance optimization

---

# 🔮 Future Improvements

Planned roadmap:

- AI-powered college recommendations
- Redis caching
- Elasticsearch search
- career intelligence dashboards
- personalized notifications
- advanced analytics
- chatbot-based counselling
- scholarship recommendation engine

---

# 🤝 Contributing

Contributions are welcome.

1. Fork repository
2. Create feature branch
3. Commit changes
4. Submit pull request

---

# 📄 License

MIT License

---

# 👨‍💻 Author

**Abhishek Amar**

GitHub: https://github.com/Abhish0030

---

# 📸 Screenshots

_Add application screenshots after deployment._

# 🎓 Onboarding Buddy System

A modern, full-stack web application that helps new members adapt to a campus organization by connecting them with experienced buddies.

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, React Router v6   |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| HTTP       | Axios                             |

---

## 📁 Project Structure

```
TITIP/
├── backend/
│   ├── models/          # Mongoose schemas (User, Match, Message, Progress, Evaluation)
│   ├── routes/          # Express routes (auth, users, matches, messages, progress, evaluations)
│   ├── middleware/      # JWT auth middleware
│   ├── server.js        # Express entry point
│   └── .env.example     # Environment variable template
│
└── frontend/
    └── src/
        ├── api/         # Axios instance + API helpers
        ├── context/     # AuthContext (JWT state)
        ├── components/  # Layout, ProtectedRoute
        ├── pages/       # All app pages
        └── styles/      # global.css
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017 (or provide a cloud URI)

### 1. Backend

```bash
cd backend
cp .env.example .env      # Edit MONGO_URI and JWT_SECRET if needed
npm install
npm run dev               # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:3000
```

The Vite dev server proxies all `/api` requests to `http://localhost:5000`.

---

## 👤 User Roles

| Role         | Access                                                              |
|--------------|---------------------------------------------------------------------|
| `admin`      | Full access: member management, buddy matching, all dashboards      |
| `buddy`      | View assigned members, chat, update milestones, submit reports      |
| `new_member` | View assigned buddy, chat, view progress, submit evaluation         |

---

## ✨ Features

1. **Authentication** — Register/Login with JWT tokens. Role-based access control.
2. **Dashboard** — Stats cards, recent matches, progress overview.
3. **Member Management** — List, search, edit, and delete members/buddies (admin).
4. **Buddy Matching** — Manual or auto-matching. Status management.
5. **Messages** — Real-time-style chat per buddy–member pair.
6. **Progress Tracking** — Milestone checklist, buddy progress reports, progress bars.
7. **Evaluation** — Star ratings (communication, helpfulness, availability, overall) + feedback.
8. **Profile** — Edit personal details, change password.

---

## 🎨 Design

- Warm, modern color palette (amber/orange primary)
- Clean minimalist layout with a collapsible sidebar
- Fully responsive for desktop, tablet, and mobile
- Smooth transitions and hover states throughout

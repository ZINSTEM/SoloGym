# SoloGym Tracker

A full-stack gamified fitness tracker inspired by the **Solo Leveling** manhwa. Level up through real-life physical tasks, earn XP, and allocate stat points to attributes (Strength, Endurance, Agility, Vitality).

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Framer Motion, Chart.js, React Toastify
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Styling:** Vanilla CSS (Solo Leveling dark theme with glowing blue accents)

## Features

- User registration/login with JWT
- Dashboard with Status Window (XP bar, level, attributes), daily missions, quick-add task
- Full Status page: allocate stat points earned on level up
- Missions: CRUD tasks/goals/activities with type, difficulty, XP reward, deadline; mark complete to gain XP and level up
- Profile: badges, weekly XP chart (Chart.js), attributes table with weekly change, completed missions history
- Level-up modal with animation; optional badge unlocks (first quest, strength 5, level 5)
- Dark theme, responsive layout, PWA manifest

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
cd sologym-tracker
npm run install:all
```

### Environment

1. In `server/`, copy `.env.example` to `.env`:
   ```bash
   cd server && cp .env.example .env
   ```
2. Set `MONGODB_URI` (e.g. `mongodb://localhost:27017/sologym`) and `JWT_SECRET`.

### Seed (optional)

```bash
npm run seed
```

Creates demo user: **demo@sologym.com** / **demo123**.

### Run

- **Dev (client + server):** from project root:
  ```bash
  npm run dev
  ```
- **Client only:** `cd client && npm run dev` (port 3000, proxies `/api` to backend)
- **Server only:** `cd server && npm run dev` (port 5000)

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
sologym-tracker/
├── client/                 # React (Vite)
│   ├── public/
│   │   ├── manifest.json   # PWA
│   │   └── favicon.svg
│   └── src/
│       ├── components/     # Layout, Nav, StatusWindow, LevelUpModal, ProtectedRoute
│       ├── context/        # AuthContext
│       ├── pages/          # Home, Login, Register, Dashboard, Status, Missions, Profile
│       ├── services/       # api (axios)
│       ├── styles/         # global.css
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/            # db.js
│   ├── middleware/        # auth.js (JWT protect)
│   ├── models/            # User, Task, AttributeHistory
│   ├── routes/            # auth, tasks, user
│   ├── scripts/           # seed.js
│   └── server.js
├── package.json
└── README.md
```

## Deployment

- **Frontend:** Build with `npm run build` (in `client/`), deploy to **Vercel** or any static host. Set API base URL to your backend (e.g. env `VITE_API_URL` and use in `api.js`).
- **Backend:** Deploy to **Render**, **Heroku**, or similar. Set `MONGODB_URI` (e.g. MongoDB Atlas) and `JWT_SECRET`. Enable CORS for your frontend origin.

## License

MIT.
"# SoloGym" 

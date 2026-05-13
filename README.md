# 🎯 VisionFlow – Fullstack Goal Tracker

A fullstack TypeScript application for tracking personal goals, to build habits and stay motivated with a visual vision board and task calendar.

**Live:** https://visionflow-omega-brown.vercel.app  
**API:** https://visionflow-backend-i4j7.onrender.com  
**Swagger:** https://visionflow-backend-i4j7.onrender.com/api-docs

## Tech Stack

**Frontend:** Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Tailwind CSS + Vite  
**Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + Swagger  


## Key Features

- **JWT Authentication** — register, login, protected routes, navigation guards
- **Goals** — create with category, target date, optional image; mark done with undo support
- **Recurring Tasks** — linked to goals, repeat on selected days of the week until the target date
- **Calendar** — monthly view with drag & drop, completion photos, date-range tasks
- **Progress Tracking** — per-task progress bars calculated from start date to target date
- **Shared Tasks** — invite collaborators, accept/decline invites, remove participants
- **Explore** — public community feed of completed goals and task progress photos
- **Vision Board** — visual pinboard of goal images

## Setup

### Backend
```bash
cd backend
npm install
# Create .env with MONGODB_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=https://visionflow-backend-i4j7.onrender.com
# Create .env.local with VITE_API_URL=http://localhost:5001/api
npm run dev
```


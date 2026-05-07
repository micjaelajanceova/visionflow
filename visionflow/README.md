# 🎯 LifeBoard – Fullstack Goal Tracker

A fullstack TypeScript application for tracking personal goals, building habits, and staying motivated with a visual vision board and task calendar.

## Tech Stack

**Frontend:** Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Tailwind CSS + Vite  
**Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + Swagger  

## Features

- 🎯 **Goals** – Create, edit, delete goals with categories, tracking types and deadlines
- 🖼 **Vision Board** – Masonry collage of all your goals with images
- 📅 **Calendar** – Monthly view with task/todo management per day, goal deadline markers
- 📈 **Progress** – Log daily/weekly progress per goal
- 📓 **Journal** – Reflective writing entries per goal
- 🏆 **30-Day Challenges** – Habit building with streak tracking
- 🌍 **Explore** – Browse public goals from the community
- 🔐 **Auth** – JWT-based login/registration with navigation guards

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
# Create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

### API Docs
Visit `http://localhost:5000/api-docs` for Swagger documentation.

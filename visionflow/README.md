# 🎯 VisionFlow – Fullstack Goal Tracker

A fullstack TypeScript application for tracking personal goals, to build habits and stay motivated with a visual vision board and task calendar.

## Tech Stack

**Frontend:** Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Tailwind CSS + Vite  
**Backend:** Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + Swagger  

## Features

- 🎯 **Goals** – Create, edit, delete goals with categories, setting days to repeat task in each weak to meet your goals and deadlines
- 🖼 **Vision Board** – Collage of all your goals with images
- 📅 **Calendar** – Monthly view with task/todo management per day, goal deadline markers
- 📈 **Progress** – Log daily/weekly progress per goal
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

# MissingPiece

MissingPiece is a full-stack web application. The project is organized into feature-based folders to maintain a scalable and modular codebase.

## Tech Stack

**Frontend:** React, Vite, TailwindCSS, TypeScript, Axios, React Router, Vitest
**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), Redis, Stripe, Resend, Cloudinary, Zod, Jest

## Setup Instructions

### Environment Variables

You need to set up environment variables for both the backend and frontend.

**Backend (`backend/.env`)**
Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template:
- `MONGO_URI`
- `PORT`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `REDIS_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend/` directory using `frontend/.env.example` as a template:
- `VITE_API_URL`

### Installation

Install dependencies for both projects from their respective directories:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Running Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Project Structure

This project uses a feature-based architecture to keep related logic, components, routes, and services together.
- **Backend features:** located under `backend/src/features/`
- **Frontend features:** located under `frontend/src/features/`

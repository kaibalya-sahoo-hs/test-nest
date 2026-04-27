# Ecommerce App

A full-stack ecommerce application built with React (frontend) and NestJS (backend). The app uses PostgreSQL via TypeORM and supports user, product, cart, payment, and admin management features.

## Table of Contents
- **Project structure**
- **Prerequisites**
- **Installation**
- **Running (dev)**
- **Docker / Services**
- **Testing**
- **Environment & configuration**

## Project structure

Top-level folders:

- `frontend/` — React frontend (Vite)
- `backend/` — NestJS backend

## Prerequisites

- Node.js
- npm or pnpm
- PostgreSQL

## Installation

Install dependencies for both backend and frontend:

```bash
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

## Running (development)

Start the backend (NestJS):

```bash
cd backend
npm run start:dev
```

Start the frontend (Vite):

```bash
cd frontend
npm run dev
```

Open the app at the URL printed by the Vite server (typically http://localhost:5173).

## Docker / Services

Run Redis (used by backend for caching or queues):

```bash
docker run -d --name my-redis -p 6379:6379 redis:latest
```

## Environment & configuration

- Backend and frontend read environment variables; ensure the backend URL is set for the frontend. Example (frontend .env):

```
VITE_BACKEND_URL=http://localhost:8000
```

- Backend database connection is configured in the backend environment files — ensure PostgreSQL credentials and DB name are set.

## Testing

Unit and integration tests use Vitest / React Testing Library for the frontend and Jest for the backend (where applicable).

Run tests from the repository root:

```bash
npm test
```

Run a single frontend test file with Vitest:

```bash
npx vitest frontend/test/<path-to-test>.jsx
```

Notes:
- If tests interact with Google APIs (e.g., updating Google Sheets), configure service account credentials as a JSON file and set the path or mock the calls in the test environment.

## Useful commands

- Start backend dev server: `cd backend && npm run start:dev`
- Start frontend dev server: `cd frontend && npm run dev`
- Run tests: `npm test`


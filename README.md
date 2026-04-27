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


## Key Features
- **Authentication**:  is implemented using JWT access and refresh tokens

- **Cart  Management**: User can manage his cart even when logged out and the the cart items will be persisted after login

- **Role Based Accesscontrol**: There are 3 roles (Admin, User, Vendor) in the application and separate dashboard for every role an separate ecces for different roles

- **Vendor System**: Vendor can manage products (CRUD), coupons (CRUD) and update the status of orders , and can withdraw funds.

- **Admin System**: Admin can manage vendors(CRUD) , and can manage vendors and their status and can also withdraw funds

- **Payment Gateway**: User can add to cart items even while loggedout , added payment gateway integration with razor pay


## Project Structure

```text
├── backend/                  # NestJS API Root
│   ├── src/                  # Application source code
│   │   ├── modules/          # Feature modules (Auth, Product, Order, etc.)
│   │   └── main.ts           # NestJS entry point
│   ├── test/                 # test Cases
│   ├── data-source.ts        # TypeORM database migration configuration
│   └── .env.example          # Template for backend environment variables
├── frontend/                 # React Frontend Root
│   ├── src/                  # React source code and co-located tests
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route components (Dashboard, Login, etc.)
│   │   ├── context/          # React Context providers (Auth, Global State)
│   │   └── utils/            # Helper functions and API services
│   ├── vite.config.js        # Vite configuration file
│   └── .env.example          # Template for frontend environment variables
└── README.md                 # Project documentation
```
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
## Understanding the application before running

### Setup the enviorment for backend
Create a file named `.env` in the `backend/` folder:
```properties
PORT=your_port

DB_NAME=postgres_db_name
DB_PASS=postgres_db_password
DB_USERNAME=postgres_db_username
JWT_SECRET=anysecretstring

APP_PASSWORD=google_app_password
GOOGLE_MAIL=gmail_address

FRONTEND_URL=frontend_running_url

RAZORPAY_TEST_APIKEY=razorpay_test_apikey
RAZORPAY_TEST_APISECRET=razorpay_api_secert
RAZORPAY_WEBHOOK_SECRET=secretstring

RAZORPAY_PAYOUT_TEST_APIKEY=razorpayx_test_apikey
RAZORPAY_PAYOUT_TEST_APISECRET=secretcode


ADMIN_EMAIL=admin_email
ADMIN_PASSWORD=admin_password
```

### Setup the enviorment for backend
Create a file named `.env` in the `backend/` folder:
```properties
VITE_RAZORPAY_TEST_KEY=razorpay_test_credentials
VITE_BACKEND_URL=running_backend_url
VITE_PORT=your_port
```

## For testing enviorment
Add a the following variable to `.env` in the `backend/` folder
```properties
GOOGLE_CRED_PATH=google_credentails_file_path
GOOGLE_SHEET_ID=google_sheet_id
```

## Migration
No need to run migration after setting up the enviorment when the application runs the migration files runs automatically if its does not run run with the following command

```bash 
npm run migartion:run
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

Notes:
- After setting up admin and some dummy users and some dummy products will be added automatically


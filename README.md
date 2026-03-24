# User Management System

A full-stack **User Management System** built with **React (Frontend)** and **NestJS (Backend)** using **PostgreSQL** as the database.

The system allows managing users by performing operations such as creating, viewing, updating, and deleting user records.

---

## Project Structure

```
├── frontend/        # React frontend 
│
├── backend/         # NestJS backend API
│
└── README.md
```

---

## Prerequisites

Before running the project, make sure you have the following installed:

* Node.js
* npm
* PostgreSQL

---

## Installation

Clone the repository and install dependencies for both frontend and backend.

### Install Backend Dependencies

Navigate to the backend folder:

```
cd backend
npm install
```

### Install Frontend Dependencies

Navigate to the frontend folder:

```
cd frontend
npm install
```

---

## Running the Project

### Start Backend (NestJS Dev Server)

Inside the **backend** folder run:

```
npm run start:dev
```

This will start the backend server in development mode.

---

### Start Frontend (React Dev Server)

Inside the **frontend** folder run:

```
npm run dev
```

This will start the React development server.

---

## Database

The project uses **PostgreSQL** as the database.

Make sure PostgreSQL is running and the database configuration is correctly set in the backend environment configuration.

---

## Technologies Used

Frontend:

* React

Backend:

* NestJS
* Node.js

Database:

* PostgreSQL (TypeORM)

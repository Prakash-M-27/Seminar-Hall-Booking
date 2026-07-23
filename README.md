# Seminar Hall Booking System

A full-stack web application for booking seminar halls in a college. Staff can view availability in a grid, book halls for specific periods, and manage their bookings. Admins can manage halls, users, and all bookings.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB Atlas (via Mongoose)
- **Auth:** JWT (JSON Web Tokens) + bcrypt

## Prerequisites

- Node.js (v18+)
- A MongoDB Atlas account (free tier works)

## Setup

### 1. MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (M0 free tier)
3. Under **Database Access**, create a database user with username and password
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development)
5. Go to **Database > Connect > Drivers** and copy the connection string

### 2. Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hall-booking?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key
```

Seed the database (creates admin user + 3 default halls):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`

## Default Login

- **Admin:** admin@college.edu / admin123

## Features

### Staff
- View hall availability in a real-time grid (date-wise)
- Book a hall by clicking an available slot
- View and cancel own bookings

### Admin
- Manage seminar halls (add, edit, delete)
- Manage staff accounts (add, delete)
- View all bookings with filters (date, status)
- Approve or reject pending bookings

## Periods

| Period | Time |
|--------|------|
| 1 | 9:00 - 9:45 |
| 2 | 9:45 - 10:30 |
| 3 | 10:45 - 11:30 |
| 4 | 11:30 - 12:15 |
| 5 | 1:00 - 1:45 |
| 6 | 1:45 - 2:30 |
| 7 | 2:45 - 3:30 |
| 8 | 3:30 - 4:15 |

## Project Structure

```
Hall-Booking/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server entry
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/         # Auth & role middleware
│   │   ├── lib/db.ts          # MongoDB connection
│   │   └── seed.ts            # Database seeder
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.ts       # Axios config with interceptors
│   │   ├── context/           # Auth context
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   │   └── admin/         # Admin pages
│   │   ├── App.tsx            # Routes
│   │   └── main.tsx           # Entry point
│   └── package.json
└── README.md
```

# FixMyCampus

A production-ready complaint management system built with the MERN stack.

## Features
- **Secure Authentication:** JWT-based login and registration for Students, Faculty, and Admin.
- **Role-Based Authorization:** Custom middleware to protect routes and restrict actions based on user roles.
- **Complaint Lifecycle:** Submit, track, and update Campus Issues through various stages (Pending, Accepted, In Progress, Completed).
- **Admin Dashboard:** Centralized panel for admins to review all Campus Issues, add remarks, and provide official support information.
- **Modern UI:** Clean, responsive design with glassmorphism aesthetics and smooth animations.

## Tech Stack
- **Frontend:** React, Vite, Framer Motion, Lucide React, Axios.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Helmet.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a remote URI)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## User Roles
1. **Student:** Can register, login, submit Campus Issues, and track their own issue status.
2. **Faculty:** Same as student, but with a faculty designation for categorization.
3. **Admin:** Full control over all Campus Issues. Can update status, add internal remarks, and send public responses.

---

## 🚀 Quick Start (Running the App)

1. **Seed the Database:**
   Follow this step to create the default admin account:
   ```bash
   cd backend
   node utils/seeder.js
   ```

2. **Start the Application:**
   Run both servers in separate terminals:
   - **Backend:** `cd backend && npm run dev`
   - **Frontend:** `cd frontend && npm run dev`

3. **Access the App:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

## 🔑 Demo Admin Credentials

Use these details to log in as the administrator:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@college.edu` |
| **Password** | `password123` |

---
<!--
## Sample Admin Contact Info
- **Office:** Room 402, Main Block
- **Phone:** +91 9876543210
- **Email:** admin@college.edu
- **Hours:** 10:00 AM - 4:00 PM
=======
# FixMyCampus
>>>>>>> cc320534e24afa642058e892adbdbe0920a6ef81
-->

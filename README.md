# ClassCrew — Premium SaaS Classroom Collaboration Platform

> **One Classroom. Every Connection.**

ClassCrew is a production-ready, full-stack educational collaboration platform designed for universities and schools. Built with modern SaaS aesthetics (inspired by Linear, Vercel, and Notion), ClassCrew simplifies classroom management, assignment tracking, auto-graded quizzes, attendance registers, and academic gradebooks into one unified workspace.

---

## ✨ Features Overview

### 👨‍🏫 Teacher Portal
- **Dashboard Overview**: Active classroom count, total students, pending submissions to grade, and live quizzes.
- **Classroom Management**: Create classrooms with auto-generated 6-character access codes and invite links.
- **Assignments Workspace**: Create and publish assignments with due dates and max marks. Grade student submissions with inline feedback.
- **Interactive Quiz Builder**: Build quizzes with MCQs and True/False questions. Auto-scoring evaluates student attempts instantly.
- **Attendance Register**: Daily attendance table with Present/Absent toggles and bulk actions.
- **Spreadsheet Gradebook**: Manage internal, quiz, mid semester, and end semester scores with auto-calculated total grades.
- **Class Analytics**: Attendance progress charts and top student leaderboards.

### 🎓 Student Portal
- **Streamlined Home**: Students land directly on **My Classrooms** (zero dashboard clutter).
- **Instant Join**: Enroll in classrooms in seconds using a 6-character code.
- **Assignment Turn-In**: View homework details and submit work with one click.
- **Quiz Taking Interface**: Take timed quizzes with a **Live Countdown Timer** and instant score celebration dialogs.
- **Academic Calendar**: Agenda schedule for assignment deadlines, quiz dates, and classroom events.
- **Academic Report Card**: Subject-wise examination score breakdown and grade status.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, React Router v7
- **Backend**: Node.js, Express, TypeScript, Zod Validation, Firebase Admin SDK
- **Database**: Supabase PostgreSQL (14 tables with UUIDs, Enums, Cascading Keys, and Auto Triggers)
- **Auth**: Firebase Authentication (Email/Password & Google OAuth) with Backend JWT verification

---

## 📁 Repository Structure

```
ClassCrew/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── app/                # App Router & providers
│   │   ├── components/         # Design system & shared components
│   │   ├── contexts/           # AuthContext & ThemeContext
│   │   ├── features/           # Auth, Landing, Teacher, Student, Classroom features
│   │   ├── services/           # Fetch API service layer
│   │   ├── styles/             # Global tokens, auth, and component CSS
│   │   └── types/              # TypeScript definitions
│   ├── .env.example
│   └── vercel.json
├── server/                     # Express Backend Server
│   ├── src/
│   │   ├── controllers/        # Express route controllers
│   │   ├── database/           # Schema SQL migrations & seed scripts
│   │   ├── middleware/         # Auth, Zod validation, Error handling
│   │   ├── repositories/       # Database SQL query layer
│   │   ├── routes/             # API routes
│   │   └── services/           # Business logic services
│   ├── .env.example
│   └── render.yaml
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL Database**: Local or hosted on [Supabase](https://supabase.com)
- **Firebase Project**: Created on [Firebase Console](https://console.firebase.google.com)

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```
Fill in your `DATABASE_URL`, `TEACHER_ACCESS_CODE` (default: `A3T26X100`), and Firebase Admin credentials in `.env`.

Apply database migrations:
```bash
# Run database schema migration
npm run migrate
```

Start the backend development server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
```
Fill in your Firebase Web App credentials in `.env`.

Start Vite dev server:
```bash
npm run dev
# Application will run at http://localhost:5173
```

---

## 🔐 Demo Credentials & Teacher Code

- **Teacher Access Code**: `A3T26X100` (Required when registering a Teacher account)
- **Demo Accounts** (If seeded via `002_seed_data.sql`):
  - Teacher: `teacher@classcrew.com`
  - Student: `student1@classcrew.com`

---

## 📜 License
MIT License. Built with ❤️ for educational excellence.
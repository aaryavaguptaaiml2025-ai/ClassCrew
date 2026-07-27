# ClassCrew — Premium SaaS Classroom Collaboration Platform

> **One Classroom. Every Connection.**

ClassCrew is a production-ready, full-stack educational collaboration platform designed for universities and schools. Built with modern SaaS aesthetics (inspired by Linear, Vercel, and Notion), ClassCrew simplifies classroom management, assignment tracking, auto-graded quizzes, attendance registers, and academic gradebooks into one unified workspace.

---

## 🛠️ Step-by-Step Setup Guide

Follow this exact sequence to run ClassCrew from scratch:

### 1️⃣ Install Dependencies
Run in the root directory:
```bash
# Install root, backend, and frontend dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2️⃣ Set Up Firebase Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication** -> **Email/Password** provider.
3. For the **Frontend**: Go to Project Settings -> General -> Web Apps -> Add Web App to obtain Firebase Client Web credentials.
4. For the **Backend**: Go to Project Settings -> Service Accounts -> Generate New Private Key to obtain `project_id`, `client_email`, and `private_key`.

### 3️⃣ Set Up Supabase Database
1. Go to [Supabase](https://supabase.com) and create a new project.
2. In Project Settings -> API: Obtain your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service_role secret).
3. In Project Settings -> Database -> Connection string (URI): Copy your PostgreSQL `DATABASE_URL` (format: `postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`).

### 4️⃣ Fill Environment Variables

#### Backend Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TEACHER_ACCESS_CODE=A3T26X100
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Frontend Environment (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5️⃣ Run Database Migrations
Run the automated migration runner to create all 15 tables and seed sample data:
```bash
npm run dev --prefix server # or:
cd server && npm run migrate
```
*(Alternative: You can also paste `server/src/database/migrations/001_initial_schema.sql` and `002_seed_data.sql` directly into the Supabase Dashboard SQL Editor).*

### 6️⃣ Start the Backend Server
```bash
cd server && npm run dev
# Express API runs on http://localhost:5000
```

### 7️⃣ Start the Frontend Application
In a separate terminal window:
```bash
cd client && npm run dev
# React Vite application runs on http://localhost:5173
```

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

## 🔐 Demo Credentials & Teacher Code

- **Teacher Access Code**: `A3T26X100` *(Required when registering a Teacher account)*
- **Demo Seed Accounts**:
  - Teacher: `teacher@classcrew.com`
  - Student: `student1@classcrew.com`

---

## 📜 License
MIT License. Built with ❤️ for educational excellence.
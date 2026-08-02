import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import classroomRoutes from './routes/classroom.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import marksRoutes from './routes/marks.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import profileRoutes from './routes/profile.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const PORT = env.PORT;

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// CORS: in production, validate origins; in development, allow all
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

console.log("NODE_ENV:", env.NODE_ENV);
console.log("CLIENT_URL:", env.CLIENT_URL);
console.log("allowedOrigins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow all origins
    if (env.NODE_ENV !== 'production') return callback(null, true);
    // In production, reject unknown origins
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Logging: structured in production, colorful in development
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many attempts. Please try again later.', data: null, errors: null },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please slow down.', data: null, errors: null },
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Health check endpoints (Render requires GET / or /health to return 200)
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'classcrew-api' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ClassCrew API is running', data: { timestamp: new Date().toISOString() }, errors: null });
});

app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

// Bind to 0.0.0.0 for Render/Docker compatibility
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`ClassCrew API server running on port ${PORT}`);
});

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
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
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.', data: null, errors: null },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please slow down.', data: null, errors: null },
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

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

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ClassCrew API is running', data: { timestamp: new Date().toISOString() }, errors: null });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`ClassCrew API server running on port ${PORT}`);
});

export default app;

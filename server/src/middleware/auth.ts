import type { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase.js';
import { logger } from '../config/logger.js';

export interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
  firebaseEmail?: string;
  userRole?: 'teacher' | 'student';
  userId?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid token.',
      data: null,
      errors: ['Missing or invalid Authorization header'],
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    req.firebaseEmail = decodedToken.email;
    next();
  } catch (error) {
    logger.warn('Invalid Firebase token', { error });
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      data: null,
      errors: ['Token verification failed'],
    });
  }
}

export function requireRole(...roles: ('teacher' | 'student')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
        data: null,
        errors: ['Insufficient permissions'],
      });
      return;
    }
    next();
  };
}

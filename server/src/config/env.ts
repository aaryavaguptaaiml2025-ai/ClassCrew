import 'dotenv/config';

interface ServerEnv {
  PORT: number;
  NODE_ENV: string;
  CLIENT_URL: string;
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  TEACHER_ACCESS_CODE: string;
}

export function validateServerEnv(): ServerEnv {
  const missing: string[] = [];

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const TEACHER_ACCESS_CODE = process.env.TEACHER_ACCESS_CODE || 'A3T26X100';

  const DATABASE_URL = process.env.DATABASE_URL;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
  const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

  if (!SUPABASE_URL && !DATABASE_URL) {
    missing.push('SUPABASE_URL or DATABASE_URL');
  }

  if (!SUPABASE_SERVICE_ROLE_KEY && !DATABASE_URL) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!FIREBASE_PROJECT_ID) {
    missing.push('FIREBASE_PROJECT_ID');
  }

  if (!FIREBASE_CLIENT_EMAIL) {
    missing.push('FIREBASE_CLIENT_EMAIL');
  }

  if (!FIREBASE_PRIVATE_KEY) {
    missing.push('FIREBASE_PRIVATE_KEY');
  }

  if (missing.length > 0) {
    console.warn('\n======================================================');
    console.warn('⚠️  CLASSCREW CONFIGURATION WARNING');
    console.warn('Missing environment variables:');
    missing.forEach((v) => console.warn(`  - ${v}`));
    console.warn('Please copy server/.env.example to server/.env and fill in missing credentials.');
    console.warn('======================================================\n');
  }

  return {
    PORT,
    NODE_ENV,
    CLIENT_URL,
    DATABASE_URL,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    TEACHER_ACCESS_CODE,
  };
}

export const env = validateServerEnv();

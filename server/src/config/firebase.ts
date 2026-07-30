import 'dotenv/config';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID || '';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.warn('⚠️  Firebase Admin credentials not configured. Auth token verification will fail.');
  console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in server/.env');
}

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: projectId || 'unconfigured',
      clientEmail: clientEmail || 'unconfigured@example.com',
      privateKey: privateKey || 'unconfigured',
    }),
  });
} else {
  app = getApps()[0];
}

export const firebaseAuth: Auth = getAuth(app);
export default app;

import 'dotenv/config';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.warn('⚠️  Firebase Admin credentials not set in environment. Auth token verification will fail until set in server/.env');
}

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: projectId || 'placeholder-project-id',
      clientEmail: clientEmail || 'placeholder@appspot.gserviceaccount.com',
      privateKey: privateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
    }),
  });
} else {
  app = getApps()[0];
}

export const firebaseAuth: Auth = getAuth(app);
export default app;

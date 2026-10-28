import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Service account credentials come from FIREBASE_ADMIN_* env vars (.env.local locally,
// secrets in production). Never hardcode them here: this file is committed to git.
const hasCredentials = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL
);

let adminApp: App | null = null;

if (hasCredentials) {
  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('Firebase Admin not initialized: set FIREBASE_ADMIN_* in .env.local to use it.');
}

// Null when credentials are missing — check before use (server-side only).
export const adminAuth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;

export default adminApp;

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Avoid initializing Firebase during server-side builds when public API key is missing.
// Next.js may import this module while prerendering pages during `next build`.
// If `NEXT_PUBLIC_FIREBASE_API_KEY` is not provided at build time, initialize only
// when running in the browser to prevent `auth/invalid-api-key` errors.
const hasPublicApiKey = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const app = ((): any => {
  // If we have an API key (likely provided during build), initialize normally.
  if (hasPublicApiKey) {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }

  // No API key at build time: only initialize on the client (browser).
  if (typeof window !== 'undefined') {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }

  // Server (build) and no API key: don't initialize — return undefined.
  return undefined;
})();

// Export services only if an app exists. They may be `null` on the server during build.
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;


import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAp6b0QN5jZggwQHDyQcXvYAEYi8ziP05k",
  authDomain: "autoecoli.firebaseapp.com",
  projectId: "autoecoli",
  storageBucket: "autoecoli.firebasestorage.app",
  messagingSenderId: "513531198907",
  appId: "1:513531198907:web:7bd9d1a9d740614c6ad89e",
  measurementId: "G-095P6NYFCD"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


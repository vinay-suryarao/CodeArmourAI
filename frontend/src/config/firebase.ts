import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredFirebaseKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const placeholderValues = new Set([
  'your-api-key',
  'your-project-id.firebaseapp.com',
  'your-project-id',
  'your-project-id.appspot.com',
  'your-sender-id',
  'your-app-id',
]);

const invalidKeys = requiredFirebaseKeys.filter((key) => {
  const value = firebaseConfig[key];
  return !value || placeholderValues.has(value);
});

export const firebaseConfigError =
  invalidKeys.length > 0
    ? `Firebase is not configured. Update frontend/.env with real values for: ${invalidKeys
        .map(
          (key) =>
            `VITE_FIREBASE_${key
              .replace(/[A-Z]/g, (c) => `_${c}`)
              .toUpperCase()}`
        )
        .join(', ')}`
    : null;

if (firebaseConfigError) {
  console.error(firebaseConfigError);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

/**
 * Firebase Client SDK Initialization & Adapter
 * Connects to Firebase Firestore & Auth when valid environment variables are present,
 * with Firestore offline persistence enabled and anonymous auth support.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  Auth,
  User,
} from 'firebase/auth';
import { StaffUser } from '../types/cafe';

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const apiKey = getEnvVar('VITE_FIREBASE_API_KEY');
const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');
const projectId = getEnvVar('VITE_FIREBASE_PROJECT_ID');
const storageBucket = getEnvVar('VITE_FIREBASE_STORAGE_BUCKET');
const messagingSenderId = getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID');
const appId = getEnvVar('VITE_FIREBASE_APP_ID');

export const isFirebaseConfigured: boolean = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('your-api-key') &&
  !apiKey.includes('AIzaSyDemoFakeKey')
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length
      ? initializeApp({
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId,
        })
      : getApp();

    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Fallback if already initialized
      db = getFirestore(app);
    }

    auth = getAuth(app);
  } catch (err) {
    console.warn('[Firebase] Initialization skipped or failed:', err);
  }
}

export { app, db, auth };

/**
 * Ensures anonymous authentication for customers to isolate orders/bookings per session
 */
export async function ensureAnonymousCustomerAuth(): Promise<string | null> {
  if (!auth) return null;
  try {
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (err) {
    console.warn('[Auth] Anonymous authentication failed:', err);
    return null;
  }
}

/**
 * Sign in staff member with real Firebase email and password
 */
export async function staffSignInWithEmail(
  email: string,
  pass: string
): Promise<{ uid: string; email: string; role: 'owner' | 'manager' | 'staff' }> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Running in Demo Mode.');
  }

  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const tokenResult = await cred.user.getIdTokenResult();
  const role = (tokenResult.claims.role as 'owner' | 'manager' | 'staff') ||
    (email.toLowerCase().includes('clara') || email.toLowerCase().includes('owner') || email.toLowerCase().includes('admin') ? 'owner' : 'staff');

  return {
    uid: cred.user.uid,
    email: cred.user.email || email,
    role,
  };
}

/**
 * Trigger real password reset email via Firebase Auth
 */
export async function staffSendPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Running in Demo Mode.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Staff Sign Out
 */
export async function staffSignOut(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

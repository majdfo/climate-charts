// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** Helper: read & trim env safely */
const getenv = (k: string) => (import.meta.env[k as any]?.trim?.() ?? "");

/** Read all envs (trimmed) */
const API_KEY = getenv("VITE_FIREBASE_API_KEY");
const AUTH_DOMAIN = getenv("VITE_FIREBASE_AUTH_DOMAIN");
const PROJECT_ID = getenv("VITE_FIREBASE_PROJECT_ID");
const APP_ID = getenv("VITE_FIREBASE_APP_ID");
const STORAGE_BUCKET = getenv("VITE_FIREBASE_STORAGE_BUCKET");
const MSG_SENDER_ID = getenv("VITE_FIREBASE_MESSAGING_SENDER_ID");
const MEASUREMENT_ID = getenv("VITE_FIREBASE_MEASUREMENT_ID");

/** Debug: print lengths/flags (لا تطبع القيم نفسها) */
console.info("Firebase env debug:", {
  apiKeyStartsWithAIza: API_KEY.startsWith("AIza"),
  apiKeyLength: API_KEY.length,
  hasAuthDomain: !!AUTH_DOMAIN,
  hasProjectId: !!PROJECT_ID,
  hasAppId: !!APP_ID,
  storageBucket: STORAGE_BUCKET, // للتأكد إنه appspot.com
});

/** Build config (one time) */
const firebaseConfig: FirebaseOptions = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  appId: APP_ID,
  storageBucket: STORAGE_BUCKET,                 // ← يجب أن تكون: pollen-forecast-jo.appspot.com
  messagingSenderId: MSG_SENDER_ID,
  measurementId: MEASUREMENT_ID,
};

/** Banner flag: require the 4 basics */
export const firebaseConfigured =
  !!API_KEY && !!AUTH_DOMAIN && !!PROJECT_ID && !!APP_ID;

/** Initialize */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// src/lib/firebase.ts
// --- DEBUG START ---
const getenv = (k: string) => (import.meta.env[k as any]?.trim?.() ?? "");
const _apiKey = getenv("VITE_FIREBASE_API_KEY");
const _authDomain = getenv("VITE_FIREBASE_AUTH_DOMAIN");
const _projectId = getenv("VITE_FIREBASE_PROJECT_ID");
const _appId = getenv("VITE_FIREBASE_APP_ID");

console.info("Firebase env debug:", {
  apiKeyStartsWithAIza: _apiKey.startsWith("AIza"),
  apiKeyLength: _apiKey.length,
  hasAuthDomain: !!_authDomain,
  hasProjectId: !!_projectId,
  hasAppId: !!_appId,
});
// --- DEBUG END ---

const firebaseConfig = {
  apiKey: _apiKey,
  authDomain: _authDomain,
  projectId: _projectId,
  appId: _appId,
  storageBucket: getenv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getenv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  measurementId: getenv("VITE_FIREBASE_MEASUREMENT_ID"),
};




import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// اقرأ القيم من البيئة
const env = import.meta.env;

// اطبعي أي مفاتيح ناقصة (Debug)
const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];
const missing = requiredKeys.filter((k) => !env[k as keyof typeof env]);
if (missing.length) {
  console.warn("Missing Firebase env vars:", missing);
}

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, // يفضّل appspot.com
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

// البنر يعتمد على الأربع مفاتيح
export const firebaseConfigured = missing.length === 0;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

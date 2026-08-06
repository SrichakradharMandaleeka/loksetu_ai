import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCPKpWeOxMu4STLmr5cDtpKfBpDlfiYOCI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "loksetu-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "loksetu-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "loksetu-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "226245379848",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:226245379848:web:5c9d97eb4bd7f37109cebd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LWEHY4N44K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

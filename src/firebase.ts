import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPKpWeOxMu4STLmr5cDtpKfBpDlfiYOCI",
  authDomain: "loksetu-ai.firebaseapp.com",
  projectId: "loksetu-ai",
  storageBucket: "loksetu-ai.firebasestorage.app",
  messagingSenderId: "226245379848",
  appId: "1:226245379848:web:5c9d97eb4bd7f37109cebd",
  measurementId: "G-LWEHY4N44K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

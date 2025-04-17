// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Your Firebase config ─────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBIB3YiciJapP4eU-QB54lClP5ZRyvWPCg",
  authDomain: "nearby-places-2b286.firebaseapp.com",
  projectId: "nearby-places-2b286",
  storageBucket: "nearby-places-2b286.appspot.com",
  messagingSenderId: "683815239231",
  appId: "1:683815239231:web:67dc48c00c19d5aa5fc28a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDZh_13RrctJuVh2mwMlV_lnC3chypA3EM",
  authDomain: "music-room-app-1406f.firebaseapp.com",
  databaseURL: "https://music-room-app-1406f-default-rtdb.firebaseio.com",
  projectId: "music-room-app-1406f",
  storageBucket: "music-room-app-1406f.firebasestorage.app",
  messagingSenderId: "403851777899",
  appId: "1:403851777899:web:9b4d67897bec449f4b9e2e",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

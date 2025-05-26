
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyA0FvSR6i8bJmwL0yfYBuaZ-zrIgttuZX0",
  authDomain: "eventlink-27be7.firebaseapp.com",
  projectId: "eventlink-27be7",
  storageBucket: "eventlink-27be7.firebasestorage.app",
  messagingSenderId: "461779247727",
  appId: "1:461779247727:web:88a0754304644fda11639a"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { db, app };

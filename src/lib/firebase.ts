
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyBOPRXjOjTtTvOKCFkGXdgaSpYmtORf9Eg",
  authDomain: "eventlink-wfbwp.firebaseapp.com",
  projectId: "eventlink-wfbwp",
  storageBucket: "eventlink-wfbwp.firebasestorage.app",
  messagingSenderId: "571312020757",
  appId: "1:571312020757:web:00c22ecb6424c6451b9d1c"
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

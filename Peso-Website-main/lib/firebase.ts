import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDMACv0y2mJxtr8SHBDHz-KUbhHkwG7Ja8',
  authDomain: 'peso-a779d.firebaseapp.com',
  projectId: 'peso-a779d',
  storageBucket: 'peso-a779d.firebasestorage.app',
  messagingSenderId: '961999729555',
  appId: '1:961999729555:web:3abe2b9f80cdbf3077ee66',
  measurementId: 'G-Z69EYSYK4B',
};

// Prevent duplicate initialization in Next.js dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

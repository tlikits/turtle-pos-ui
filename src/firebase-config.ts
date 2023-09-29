// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';

const firebaseConfig = require('./firebase-config.json');

// Initialize Firebase
const app: FirebaseApp = typeof window !== 'undefined' ? initializeApp(firebaseConfig) : null as any;

export const auth: Auth = typeof window !== 'undefined' ? getAuth() : null as any;
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = app ? getFirestore(app) : null as any;
export default app;

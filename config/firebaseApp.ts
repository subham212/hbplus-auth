import { getApp, getApps, initializeApp } from 'firebase/app';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  throw new Error('Missing required environment variable EXPO_PUBLIC_FIREBASE_API_KEY.');
}

const firebaseConfig = {
  apiKey,
  authDomain: 'hbplus-auth-212.firebaseapp.com',
  projectId: 'hbplus-auth-212',
  storageBucket: 'hbplus-auth-212.firebasestorage.app',
  messagingSenderId: '706169043519',
  appId: '1:706169043519:web:1c9046c1ae6760654f568a',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

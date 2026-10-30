import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';
import { app } from './firebaseApp';

// Metro selects Firebase's React Native export; TypeScript resolves its web types.
const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
  }
).getReactNativePersistence;

function createNativeAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/already-initialized'
    ) {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = createNativeAuth();

import {
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export async function signInWithGooglePlatform(): Promise<UserCredential | null> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ hd: 'hbplus.fit' });
  return signInWithPopup(auth, provider);
}

export function signOutFromGooglePlatform(): Promise<void> {
  return Promise.resolve();
}

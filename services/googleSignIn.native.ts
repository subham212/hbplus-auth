import {
  GoogleSignin,
  isCancelledResponse,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';
import { GoogleSignInSetupError } from './googleSignInErrors';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
let configured = false;

function configureGoogleSignIn() {
  if (!webClientId) {
    throw new GoogleSignInSetupError(
      'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file before signing in.',
    );
  }
  if (Platform.OS === 'ios' && !iosClientId) {
    throw new GoogleSignInSetupError(
      'Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file before signing in.',
    );
  }
  if (!configured) {
    GoogleSignin.configure({
      webClientId,
      ...(iosClientId ? { iosClientId } : {}),
    });
    configured = true;
  }
}

export async function signInWithGooglePlatform(): Promise<UserCredential | null> {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();
  if (isCancelledResponse(result)) return null;

  const { idToken } = result.data;
  if (!idToken) {
    throw new GoogleSignInSetupError(
      'Google did not return an ID token. Check that your Web OAuth client ID is correct.',
    );
  }

  return signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

export async function signOutFromGooglePlatform(): Promise<void> {
  if (configured) await GoogleSignin.signOut();
}

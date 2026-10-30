import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { auth } from '../config/firebase';
import {
  signInWithGooglePlatform,
  signOutFromGooglePlatform,
} from '../services/googleSignIn';
import { GoogleSignInSetupError } from '../services/googleSignInErrors';
import { getDomainError, isAllowedDomain } from '../utils/domainCheck';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  isSigningIn: boolean;
  isSigningOut: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signInInProgress = useRef(false);
  const signOutInProgress = useRef(false);

  // Single source of truth: Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser?.emailVerified && isAllowedDomain(firebaseUser.email)) {
          setUser(firebaseUser);
          setStatus('authenticated');
          setError(null);
        } else if (firebaseUser) {
          void firebaseSignOut(auth)
            .then(signOutFromGooglePlatform)
            .catch(() => undefined);
          setUser(null);
          setStatus('unauthenticated');
          setError(getDomainError());
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      },
      () => {
        setUser(null);
        setStatus('unauthenticated');
        setError('Could not restore your session. Please try signing in again.');
      },
    );
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    if (signInInProgress.current) return;
    signInInProgress.current = true;
    setIsSigningIn(true);
    setError(null);

    try {
      const result = await signInWithGooglePlatform();
      if (result) {
        if (result.user.emailVerified && isAllowedDomain(result.user.email)) {
          setUser(result.user);
          setStatus('authenticated');
        } else {
          await firebaseSignOut(auth);
          await signOutFromGooglePlatform();
          setUser(null);
          setStatus('unauthenticated');
          setError(getDomainError());
        }
      }
    } catch (err: unknown) {
      if (err instanceof GoogleSignInSetupError) {
        setError(err.message);
      } else {
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? String(err.code).toLowerCase()
            : '';
        const message = err instanceof Error ? err.message.toLowerCase() : '';
        if (
          code === 'sign_in_cancelled' ||
          message.includes('popup-closed-by-user') ||
          message.includes('cancelled') ||
          message.includes('canceled')
        ) {
          setError(null);
        } else if (
          message.includes('hbplus_domain_restricted') ||
          (message.includes('access restricted') &&
            message.includes('official domain email'))
        ) {
          setError(getDomainError());
        } else {
          setError('Sign-in failed. Please try again.');
        }
      }
    } finally {
      signInInProgress.current = false;
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (signOutInProgress.current) return;
    signOutInProgress.current = true;
    setIsSigningOut(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      await signOutFromGooglePlatform();
    } catch {
      setError('Sign-out failed. Please try again.');
    } finally {
      signOutInProgress.current = false;
      setIsSigningOut(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error,
      isSigningIn,
      isSigningOut,
      signInWithGoogle: signIn,
      signOut,
    }),
    [user, status, error, isSigningIn, isSigningOut, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

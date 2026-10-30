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
  ensureUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../services/userProfiles';
import {
  signInWithGooglePlatform,
  signOutFromGooglePlatform,
} from '../services/googleSignIn';
import {
  getSignInErrorMessage,
  performGoogleSignIn,
  performGoogleSignOut,
} from '../services/authFlow';
import {
  getDomainError,
  isAllowedAuthenticatedUser,
} from '../utils/authAccess';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  profileStatus: ProfileStatus;
  profileError: string | null;
  error: string | null;
  isSigningIn: boolean;
  isSigningOut: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  retryProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signInInProgress = useRef(false);
  const signOutInProgress = useRef(false);
  const profileGeneration = useRef(0);
  const profileUnsubscribe = useRef<(() => void) | null>(null);

  const syncProfile = useCallback((firebaseUser: User, generation: number) => {
    setProfile(null);
    setProfileStatus('loading');
    setProfileError(null);

    void ensureUserProfile(firebaseUser)
      .then(() => {
        if (profileGeneration.current !== generation) return;
        const unsubscribe = subscribeToUserProfile(
          firebaseUser,
          (nextProfile) => {
            if (profileGeneration.current !== generation) return;
            setProfile(nextProfile);
            setProfileStatus('ready');
            setProfileError(null);
          },
          () => {
            if (profileGeneration.current !== generation) return;
            setProfile(null);
            setProfileStatus('error');
            setProfileError('Could not load your saved profile. Check your connection and ask the project owner to confirm Firestore is set up.');
          },
        );
        if (profileGeneration.current === generation) {
          profileUnsubscribe.current = unsubscribe;
        } else {
          unsubscribe();
        }
      })
      .catch(() => {
        if (profileGeneration.current !== generation) return;
        setProfile(null);
        setProfileStatus('error');
        setProfileError('Could not load your saved profile. Check your connection and ask the project owner to confirm Firestore is set up.');
      });
  }, []);

  // Firebase Auth is the session source; profile streaming keeps role changes current.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        profileGeneration.current += 1;
        const generation = profileGeneration.current;
        profileUnsubscribe.current?.();
        profileUnsubscribe.current = null;

        if (firebaseUser && isAllowedAuthenticatedUser(firebaseUser)) {
          setUser(firebaseUser);
          setStatus('authenticated');
          setError(null);
          syncProfile(firebaseUser, generation);
        } else {
          setUser(null);
          setProfile(null);
          setProfileStatus('idle');
          setProfileError(null);
          setStatus('unauthenticated');
          if (firebaseUser) {
            setError(getDomainError());
            void firebaseSignOut(auth).then(signOutFromGooglePlatform).catch(() => undefined);
          }
        }
      },
      () => {
        profileGeneration.current += 1;
        profileUnsubscribe.current?.();
        profileUnsubscribe.current = null;
        setUser(null);
        setProfile(null);
        setProfileStatus('idle');
        setStatus('unauthenticated');
        setError('Could not restore your session. Please try signing in again.');
      },
    );
    return () => {
      profileGeneration.current += 1;
      profileUnsubscribe.current?.();
      unsubscribe();
    };
  }, [syncProfile]);

  const signIn = useCallback(async () => {
    if (signInInProgress.current) return;
    signInInProgress.current = true;
    setIsSigningIn(true);
    setError(null);

    try {
      const outcome = await performGoogleSignIn({
        signIn: signInWithGooglePlatform,
        signOutFirebase: () => firebaseSignOut(auth),
        signOutProvider: signOutFromGooglePlatform,
      });

      if (outcome.type === 'denied') setError(getDomainError());
    } catch (err: unknown) {
      setError(getSignInErrorMessage(err));
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
      await performGoogleSignOut({
        signOutFirebase: () => firebaseSignOut(auth),
        signOutProvider: signOutFromGooglePlatform,
      });
    } catch {
      setError('Sign-out failed. Please try again.');
    } finally {
      signOutInProgress.current = false;
      setIsSigningOut(false);
    }
  }, []);

  const retryProfile = useCallback(() => {
    if (!user) return;
    profileGeneration.current += 1;
    const generation = profileGeneration.current;
    profileUnsubscribe.current?.();
    profileUnsubscribe.current = null;
    syncProfile(user, generation);
  }, [syncProfile, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      status,
      profileStatus,
      profileError,
      error,
      isSigningIn,
      isSigningOut,
      signInWithGoogle: signIn,
      signOut,
      retryProfile,
    }),
    [
      user,
      profile,
      status,
      profileStatus,
      profileError,
      error,
      isSigningIn,
      isSigningOut,
      signIn,
      signOut,
      retryProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

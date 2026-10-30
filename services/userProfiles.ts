import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../config/firestore';
import { isAllowedAuthenticatedUser } from '../utils/authAccess';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const PAGE_SIZE = 25;

function profileFromData(data: DocumentData, expectedUid: string): UserProfile {
  if (
    data.uid !== expectedUid ||
    typeof data.email !== 'string' ||
    (data.displayName !== null && typeof data.displayName !== 'string') ||
    (data.photoURL !== null && typeof data.photoURL !== 'string') ||
    (data.role !== 'user' && data.role !== 'admin') ||
    !(data.createdAt instanceof Timestamp) ||
    !(data.updatedAt instanceof Timestamp)
  ) {
    throw new Error('The saved user profile is invalid. Contact your project administrator.');
  }

  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function authProfile(user: User) {
  if (!isAllowedAuthenticatedUser(user) || !user.email) {
    throw new Error('Only verified @hbplus.fit users can create a profile.');
  }

  return {
    email: user.email,
    displayName: user.displayName?.trim().slice(0, 200) || null,
    photoURL: user.photoURL?.slice(0, 2048) || null,
  };
}

export async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const current = authProfile(user);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      transaction.set(ref, {
        uid: user.uid,
        ...current,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const profile = profileFromData(snapshot.data(), user.uid);
    if (
      profile.email !== current.email ||
      profile.displayName !== current.displayName ||
      profile.photoURL !== current.photoURL
    ) {
      transaction.update(ref, { ...current, updatedAt: serverTimestamp() });
    }
  });
}

export function subscribeToUserProfile(
  user: User,
  onProfile: (profile: UserProfile) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', user.uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onError(new Error('The saved user profile could not be found.'));
        return;
      }
      try {
        onProfile(profileFromData(snapshot.data(), user.uid));
      } catch (error) {
        onError(error instanceof Error ? error : new Error('The saved user profile is invalid.'));
      }
    },
    (error) => onError(error),
  );
}

export interface UserProfilePage {
  profiles: UserProfile[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function getUserProfilePage(
  cursor: QueryDocumentSnapshot<DocumentData> | null = null,
): Promise<UserProfilePage> {
  let pageQuery = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE + 1),
  );
  if (cursor) pageQuery = query(pageQuery, startAfter(cursor));

  const result = await getDocs(pageQuery);
  const visibleDocs = result.docs.slice(0, PAGE_SIZE);
  return {
    profiles: visibleDocs.map((snapshot) => profileFromData(snapshot.data(), snapshot.id)),
    cursor: visibleDocs.at(-1) ?? null,
    hasMore: result.docs.length > PAGE_SIZE,
  };
}

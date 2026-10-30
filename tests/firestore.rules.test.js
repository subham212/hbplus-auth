const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} = require('firebase/firestore');

const PROJECT_ID = 'demo-hbplus-auth';
const EMAIL = 'member@hbplus.fit';
let environment;

function allowedContext(uid = 'member', email = EMAIL, emailVerified = true) {
  return environment.authenticatedContext(uid, {
    email,
    email_verified: emailVerified,
  }).firestore();
}

function profileData(uid, email = EMAIL, role = 'user') {
  return {
    uid,
    email,
    displayName: 'Team Member',
    photoURL: null,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

test.before(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(join(__dirname, '..', 'firestore.rules'), 'utf8'),
    },
  });
});

test.beforeEach(async () => {
  await environment.clearFirestore();
});

test.after(async () => {
  await environment?.cleanup();
});

test('verified team members can create and read only their own user profile', async () => {
  const db = allowedContext();
  await assertSucceeds(setDoc(doc(db, 'users/member'), profileData('member')));
  await assertSucceeds(getDoc(doc(db, 'users/member')));

  const uppercaseDomain = allowedContext('uppercase', 'Person@HBPLUS.FIT');
  await assertSucceeds(
    setDoc(doc(uppercaseDomain, 'users/uppercase'), profileData('uppercase', 'Person@HBPLUS.FIT')),
  );
});

test('anonymous, unverified, external, and lookalike accounts cannot access profiles', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const unverified = allowedContext('unverified', 'unverified@hbplus.fit', false);
  const external = allowedContext('external', 'person@gmail.com');
  const lookalike = allowedContext('lookalike', 'person@evil-hbplus.fit');

  await assertFails(getDoc(doc(anonymous, 'users/member')));
  await assertFails(setDoc(doc(anonymous, 'users/anonymous'), profileData('anonymous')));
  await assertFails(setDoc(doc(unverified, 'users/unverified'), profileData('unverified', 'unverified@hbplus.fit')));
  await assertFails(setDoc(doc(external, 'users/external'), profileData('external', 'person@gmail.com')));
  await assertFails(setDoc(doc(lookalike, 'users/lookalike'), profileData('lookalike', 'person@evil-hbplus.fit')));
});

test('users cannot create or promote an admin profile', async () => {
  const db = allowedContext();
  await assertFails(setDoc(doc(db, 'users/member'), profileData('member', EMAIL, 'admin')));
  await assertSucceeds(setDoc(doc(db, 'users/member'), profileData('member')));
  await assertFails(updateDoc(doc(db, 'users/member'), { role: 'admin' }));
});

test('users can update profile fields but cannot change identity, role, or creation time', async () => {
  const db = allowedContext();
  const ref = doc(db, 'users/member');
  await assertSucceeds(setDoc(ref, profileData('member')));
  await assertSucceeds(updateDoc(ref, { displayName: 'Updated Name', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { role: 'admin', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { uid: 'other', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(ref));
});

test('users cannot read other profiles, list users, or access other collections', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/other'), profileData('other', 'other@hbplus.fit'));
  });
  const db = allowedContext();

  await assertFails(getDoc(doc(db, 'users/other')));
  await assertFails(setDoc(doc(db, 'users/other'), profileData('other', 'other@hbplus.fit')));
  await assertFails(getDocs(query(collection(db, 'users'), orderBy('createdAt'))));
  await assertFails(setDoc(doc(db, 'private/record'), { value: true }));
});

test('a trusted admin can read and page through the team directory', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, 'users/admin'), {
      uid: 'admin', email: 'admin@hbplus.fit', displayName: 'Admin', photoURL: null,
      role: 'admin', createdAt: new Date(), updatedAt: new Date(),
    });
    await setDoc(doc(adminDb, 'users/member'), {
      uid: 'member', email: EMAIL, displayName: 'Member', photoURL: null,
      role: 'user', createdAt: new Date(), updatedAt: new Date(),
    });
  });
  const db = allowedContext('admin', 'admin@hbplus.fit');

  await assertSucceeds(getDoc(doc(db, 'users/member')));
  const directory = await assertSucceeds(
    getDocs(query(collection(db, 'users'), orderBy('createdAt'))),
  );
  assert.equal(directory.size, 2);
});

test('admin privileges do not allow writes to user profiles or other collections', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/admin'), {
      uid: 'admin', email: 'admin@hbplus.fit', displayName: 'Admin', photoURL: null,
      role: 'admin', createdAt: new Date(), updatedAt: new Date(),
    });
  });
  const db = allowedContext('admin', 'admin@hbplus.fit');

  await assertFails(updateDoc(doc(db, 'users/admin'), { role: 'user', updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db, 'private/record'), { value: true }));
});

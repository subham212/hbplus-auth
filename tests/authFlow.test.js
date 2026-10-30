const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getSignInErrorMessage,
  performGoogleSignIn,
  performGoogleSignOut,
} = require('../services/authFlow');

const allowedUser = { email: 'person@hbplus.fit', emailVerified: true };

test('successful sign-in returns the allowed user without signing out', async () => {
  const calls = [];
  const outcome = await performGoogleSignIn({
    signIn: async () => {
      calls.push('sign-in');
      return { user: allowedUser };
    },
    signOutFirebase: async () => calls.push('firebase-sign-out'),
    signOutProvider: async () => calls.push('provider-sign-out'),
  });

  assert.deepEqual(outcome, { type: 'authenticated', user: allowedUser });
  assert.deepEqual(calls, ['sign-in']);
});

test('cancelled sign-in performs no sign-out', async () => {
  const calls = [];
  const outcome = await performGoogleSignIn({
    signIn: async () => {
      calls.push('sign-in');
      return null;
    },
    signOutFirebase: async () => calls.push('firebase-sign-out'),
    signOutProvider: async () => calls.push('provider-sign-out'),
  });

  assert.deepEqual(outcome, { type: 'cancelled' });
  assert.deepEqual(calls, ['sign-in']);
});

test('rejected sign-in clears Firebase then the Google provider session', async () => {
  const calls = [];
  const outcome = await performGoogleSignIn({
    signIn: async () => ({
      user: { email: 'person@gmail.com', emailVerified: true },
    }),
    signOutFirebase: async () => calls.push('firebase-sign-out'),
    signOutProvider: async () => calls.push('provider-sign-out'),
  });

  assert.deepEqual(outcome, { type: 'denied' });
  assert.deepEqual(calls, ['firebase-sign-out', 'provider-sign-out']);
});

test('rejected sign-in skips provider sign-out when Firebase sign-out fails', async () => {
  const calls = [];
  await assert.rejects(
    performGoogleSignIn({
      signIn: async () => ({
        user: { email: 'person@gmail.com', emailVerified: true },
      }),
      signOutFirebase: async () => {
        calls.push('firebase-sign-out');
        throw new Error('Firebase unavailable');
      },
      signOutProvider: async () => calls.push('provider-sign-out'),
    }),
    /Firebase unavailable/,
  );
  assert.deepEqual(calls, ['firebase-sign-out']);
});

test('logout clears Firebase before the Google provider session', async () => {
  const calls = [];
  await performGoogleSignOut({
    signOutFirebase: async () => calls.push('firebase-sign-out'),
    signOutProvider: async () => calls.push('provider-sign-out'),
  });
  assert.deepEqual(calls, ['firebase-sign-out', 'provider-sign-out']);
});

test('sign-in errors preserve setup guidance and normalize cancellations', () => {
  const setupError = new Error('Set the web client ID.');
  setupError.name = 'GoogleSignInSetupError';
  assert.equal(getSignInErrorMessage(setupError), 'Set the web client ID.');
  assert.equal(getSignInErrorMessage({ code: 'sign_in_cancelled' }), null);
  assert.equal(
    getSignInErrorMessage(new Error('Firebase: popup-closed-by-user')),
    null,
  );
});

test('sign-in errors show the domain message or a safe generic message', () => {
  assert.equal(
    getSignInErrorMessage(new Error('HBPLUS_DOMAIN_RESTRICTED: rejected')),
    'Access restricted. Please login using your official domain email.',
  );
  assert.equal(
    getSignInErrorMessage(new Error('unexpected backend detail')),
    'Sign-in failed. Please try again.',
  );
  assert.equal(getSignInErrorMessage(null), 'Sign-in failed. Please try again.');
});

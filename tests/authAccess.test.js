const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canAccessAdmin,
  getAuthRoute,
  isAllowedAuthenticatedUser,
} = require('../utils/authAccess');
const { isAllowedUser } = require('../functions/domainPolicy');

const allowedUser = { email: 'person@cutm.ac.in', emailVerified: true };

test('allows only verified users on the exact approved domain', () => {
  const cases = [
    [allowedUser, true],
    [{ email: 'Person@CUTM.AC.IN', emailVerified: true }, true],
    [{ email: ' person@cutm.ac.in ', emailVerified: true }, true],
    [{ email: 'person@gmail.com', emailVerified: true }, false],
    [{ email: 'person@evil-cutm.ac.in', emailVerified: true }, false],
    [{ email: 'person@cutm.ac.in.evil.com', emailVerified: true }, false],
    [{ email: 'person@cutm.ac.in@evil.com', emailVerified: true }, false],
    [{ email: 'person@cutm.ac.in', emailVerified: false }, false],
    [{ email: 'person@cutm.ac.in', emailVerified: 'true' }, false],
    [null, false],
    [undefined, false],
  ];

  for (const [user, expected] of cases) {
    assert.equal(isAllowedAuthenticatedUser(user), expected, JSON.stringify(user));
  }
});

test('client and blocking-function domain policies stay in sync', () => {
  const cases = [
    allowedUser,
    { email: 'Person@CUTM.AC.IN', emailVerified: true },
    { email: ' person@cutm.ac.in ', emailVerified: true },
    { email: 'person@gmail.com', emailVerified: true },
    { email: 'person@evil-cutm.ac.in', emailVerified: true },
    { email: 'person@cutm.ac.in.evil.com', emailVerified: true },
    { email: 'person@cutm.ac.in@evil.com', emailVerified: true },
    { email: 'person@cutm.ac.in', emailVerified: false },
    null,
  ];

  for (const user of cases) {
    assert.equal(
      isAllowedAuthenticatedUser(user),
      isAllowedUser(user),
      JSON.stringify(user),
    );
  }
});

test('protected routes wait for auth and profile restoration', () => {
  assert.equal(getAuthRoute('loading', allowedUser), 'loading');
  assert.equal(getAuthRoute('unauthenticated', allowedUser), 'login');
  assert.equal(getAuthRoute('authenticated', allowedUser, 'loading'), 'loading');
  assert.equal(getAuthRoute('authenticated', allowedUser, 'error'), 'profile-error');
  assert.equal(getAuthRoute('authenticated', allowedUser, 'ready', { role: 'user' }), 'dashboard');
  assert.equal(getAuthRoute('authenticated', allowedUser, 'ready', { role: 'admin' }), 'dashboard');
  assert.equal(
    getAuthRoute('authenticated', { email: 'person@gmail.com', emailVerified: true }, 'ready', { role: 'user' }),
    'login',
  );
  assert.equal(
    getAuthRoute('authenticated', { email: 'person@cutm.ac.in', emailVerified: false }, 'ready', { role: 'user' }),
    'login',
  );
  assert.equal(getAuthRoute('authenticated', null), 'login');
});

test('only a loaded admin profile can open admin routes', () => {
  assert.equal(canAccessAdmin('authenticated', allowedUser, 'ready', { role: 'admin' }), true);
  assert.equal(canAccessAdmin('authenticated', allowedUser, 'ready', { role: 'user' }), false);
  assert.equal(canAccessAdmin('authenticated', allowedUser, 'loading', { role: 'admin' }), false);
  assert.equal(canAccessAdmin('unauthenticated', allowedUser, 'ready', { role: 'admin' }), false);
});

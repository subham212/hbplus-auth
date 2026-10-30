const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedUser } = require('./domainPolicy');

test('allows verified addresses on the exact approved domain, case-insensitively', () => {
  assert.equal(isAllowedUser({ email: 'person@cutm.ac.in', emailVerified: true }), true);
  assert.equal(isAllowedUser({ email: 'Person@CUTM.AC.IN', emailVerified: true }), true);
});

test('rejects other, lookalike, malformed, missing, and unverified addresses', () => {
  for (const user of [
    { email: 'person@gmail.com', emailVerified: true },
    { email: 'person@evil-cutm.ac.in', emailVerified: true },
    { email: 'person@cutm.ac.in.evil.com', emailVerified: true },
    { email: 'person@cutm.ac.in@evil.com', emailVerified: true },
    { email: null, emailVerified: true },
    { email: 'person@cutm.ac.in', emailVerified: false },
  ]) {
    assert.equal(isAllowedUser(user), false, JSON.stringify(user));
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedUser } = require('./domainPolicy');

test('allows verified addresses on the exact approved domain, case-insensitively', () => {
  assert.equal(isAllowedUser({ email: 'person@hbplus.fit', emailVerified: true }), true);
  assert.equal(isAllowedUser({ email: 'Person@HBPLUS.FIT', emailVerified: true }), true);
});

test('rejects other, lookalike, malformed, missing, and unverified addresses', () => {
  for (const user of [
    { email: 'person@gmail.com', emailVerified: true },
    { email: 'person@evil-hbplus.fit', emailVerified: true },
    { email: 'person@hbplus.fit.evil.com', emailVerified: true },
    { email: 'person@hbplus.fit@evil.com', emailVerified: true },
    { email: null, emailVerified: true },
    { email: 'person@hbplus.fit', emailVerified: false },
  ]) {
    assert.equal(isAllowedUser(user), false, JSON.stringify(user));
  }
});

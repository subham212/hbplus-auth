const { getDomainError, isAllowedAuthenticatedUser } = require('../utils/authAccess');

/**
 * @template {{ email: string | null, emailVerified: boolean }} TUser
 * @param {{
 *   signIn: () => Promise<{ user: TUser } | null>,
 *   signOutFirebase: () => Promise<unknown>,
 *   signOutProvider: () => Promise<unknown>
 * }} dependencies
 * @returns {Promise<
 *   | { type: 'cancelled' }
 *   | { type: 'authenticated', user: TUser }
 *   | { type: 'denied' }
 * >}
 */
async function performGoogleSignIn({ signIn, signOutFirebase, signOutProvider }) {
  const result = await signIn();
  if (!result) return { type: 'cancelled' };
  if (isAllowedAuthenticatedUser(result.user)) {
    return { type: 'authenticated', user: result.user };
  }

  await signOutFirebase();
  await signOutProvider();
  return { type: 'denied' };
}

/**
 * @param {{
 *   signOutFirebase: () => Promise<unknown>,
 *   signOutProvider: () => Promise<unknown>
 * }} dependencies
 */
async function performGoogleSignOut({ signOutFirebase, signOutProvider }) {
  await signOutFirebase();
  await signOutProvider();
}

/** @param {unknown} error */
function getSignInErrorMessage(error) {
  if (
    error instanceof Error &&
    error.name === 'GoogleSignInSetupError'
  ) {
    return error.message;
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code).toLowerCase()
      : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    code === 'sign_in_cancelled' ||
    message.includes('popup-closed-by-user') ||
    message.includes('cancelled') ||
    message.includes('canceled')
  ) {
    return null;
  }

  if (
    message.includes('hbplus_domain_restricted') ||
    (message.includes('access restricted') &&
      message.includes('official domain email'))
  ) {
    return getDomainError();
  }

  return 'Sign-in failed. Please try again.';
}

module.exports = {
  getSignInErrorMessage,
  performGoogleSignIn,
  performGoogleSignOut,
};

/**
 * @typedef {{ email?: string | null, emailVerified?: boolean } | null | undefined} AuthUser
 * @typedef {'loading' | 'authenticated' | 'unauthenticated'} AuthStatus
 * @typedef {'idle' | 'loading' | 'ready' | 'error'} ProfileStatus
 * @typedef {{ role?: string } | null | undefined} UserProfile
 */

/** @param {AuthUser} user */
function isAllowedAuthenticatedUser(user) {
  return (
    user?.emailVerified === true &&
    typeof user.email === 'string' &&
    /^[^@\s]+@cutm\.ac\.in$/i.test(user.email.trim())
  );
}

/**
 * @param {AuthStatus} status
 * @param {AuthUser} user
 * @param {ProfileStatus} profileStatus
 * @param {UserProfile} profile
 * @returns {'loading' | 'dashboard' | 'login' | 'profile-error'}
 */
function getAuthRoute(status, user, profileStatus = 'idle', profile = null) {
  if (status === 'loading') return 'loading';
  if (status !== 'authenticated' || !isAllowedAuthenticatedUser(user)) return 'login';
  if (profileStatus === 'loading' || profileStatus === 'idle') return 'loading';
  if (profileStatus === 'error' || !profile || !['user', 'admin'].includes(profile.role)) {
    return 'profile-error';
  }
  return 'dashboard';
}

/** @param {AuthStatus} status @param {AuthUser} user @param {ProfileStatus} profileStatus @param {UserProfile} profile */
function canAccessAdmin(status, user, profileStatus, profile) {
  return (
    getAuthRoute(status, user, profileStatus, profile) === 'dashboard' &&
    profile.role === 'admin'
  );
}

function getDomainError() {
  return 'Access restricted. Please login using your official domain email.';
}

module.exports = {
  canAccessAdmin,
  getAuthRoute,
  getDomainError,
  isAllowedAuthenticatedUser,
};

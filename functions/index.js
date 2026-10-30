const {
  HttpsError,
  beforeUserCreated,
  beforeUserSignedIn,
} = require('firebase-functions/v2/identity');
const { isAllowedUser } = require('./domainPolicy');

function requireAllowedDomain(event) {
  if (!isAllowedUser(event.data)) {
    throw new HttpsError(
      'permission-denied',
      'HBPLUS_DOMAIN_RESTRICTED: Access restricted. Please login using your official domain email.',
    );
  }
}

exports.restrictNewAccounts = beforeUserCreated(requireAllowedDomain);
exports.restrictSignIns = beforeUserSignedIn(requireAllowedDomain);

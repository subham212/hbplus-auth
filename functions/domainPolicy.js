function isAllowedUser(user) {
  return (
    typeof user?.email === 'string' &&
    /^[^@\s]+@hbplus\.fit$/i.test(user.email.trim()) &&
    user.emailVerified === true
  );
}

module.exports = { isAllowedUser };

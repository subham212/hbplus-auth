function isAllowedUser(user) {
  return (
    typeof user?.email === 'string' &&
    /^[^@\s]+@cutm\.ac\.in$/i.test(user.email.trim()) &&
    user.emailVerified === true
  );
}

module.exports = { isAllowedUser };

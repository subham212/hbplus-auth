module.exports = ({ config }) => {
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const plugins = (config.plugins ?? []).filter(
    (plugin) =>
      (Array.isArray(plugin) ? plugin[0] : plugin) !==
      '@react-native-google-signin/google-signin',
  );

  if (googleIosClientId) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: googleIosClientId.split('.').reverse().join('.') },
    ]);
  }

  return { ...config, plugins };
};

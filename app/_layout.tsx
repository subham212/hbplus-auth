import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { AuthProvider } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    TheSeasonsBold: require('../assets/fonts/the-seasons-bold.ttf'),
    GilroyMedium: require('../assets/fonts/gilroy-medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}

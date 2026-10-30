import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { getAuthRoute } from '../utils/authAccess';

export default function RootIndex() {
  const { status, user, profile, profileStatus } = useAuth();
  const destination = getAuthRoute(status, user, profileStatus, profile);

  if (destination === 'loading') return <LoadingScreen />;
  if (destination === 'profile-error') return <Redirect href="/dashboard" />;
  if (destination === 'dashboard') return <Redirect href="/dashboard" />;
  return <Redirect href="/login" />;
}

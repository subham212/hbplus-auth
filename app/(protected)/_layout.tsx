import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import ProfileErrorScreen from '../../components/ProfileErrorScreen';
import { getAuthRoute } from '../../utils/authAccess';

export default function ProtectedLayout() {
  const { user, profile, status, profileStatus, profileError, retryProfile, signOut } = useAuth();
  const destination = getAuthRoute(status, user, profileStatus, profile);

  if (destination === 'loading') return <LoadingScreen />;
  if (destination === 'profile-error') {
    return (
      <ProfileErrorScreen
        message={profileError ?? 'Your saved profile could not be loaded.'}
        onRetry={retryProfile}
        onSignOut={signOut}
      />
    );
  }
  if (destination !== 'dashboard') {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}

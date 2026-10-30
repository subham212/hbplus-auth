import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import { isAllowedDomain } from '../../utils/domainCheck';

export default function ProtectedLayout() {
  const { user, status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (!user || !user.emailVerified || !isAllowedDomain(user.email)) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}

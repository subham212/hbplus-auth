import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function RootIndex() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;
  return <Redirect href="/login" />;
}
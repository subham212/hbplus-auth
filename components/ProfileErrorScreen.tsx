import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLockup from './BrandLockup';
import { Colors, Fonts, Rounded, Spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileErrorScreen({
  message,
  onRetry,
  onSignOut,
}: {
  message: string;
  onRetry: () => void;
  onSignOut: () => Promise<void>;
}) {
  const { error, isSigningOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.shell}>
          <BrandLockup compact />
          <View style={styles.card}>
            <Text style={styles.heading} accessibilityRole="header">Your account is unavailable</Text>
            <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {message}
            </Text>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <Pressable
              style={styles.primaryButton}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading your profile"
            >
              <Text style={styles.primaryText}>Try again</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={onSignOut}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            >
              {isSigningOut ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.secondaryText}>Sign out</Text>}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.sm },
  shell: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 24 },
  card: { width: '100%', padding: 24, borderRadius: Rounded.lg, backgroundColor: Colors.neutral, borderWidth: 1, borderColor: '#E5DED4' },
  heading: { fontFamily: Fonts.serifBold, fontSize: 24, lineHeight: 39, color: Colors.onSurface },
  message: { fontFamily: Fonts.sansRegular, fontSize: 14, lineHeight: 21, color: '#625B54', marginTop: 12 },
  error: { fontFamily: Fonts.sansRegular, fontSize: 13, lineHeight: 19, color: Colors.error, marginTop: 10 },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 24, borderRadius: Rounded.md, backgroundColor: Colors.primary },
  primaryText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.neutral },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondaryText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.primary },
});

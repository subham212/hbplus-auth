import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Fonts, Rounded } from '../constants/theme';
import { getAuthRoute } from '../utils/authAccess';

export default function RootIndex() {
  const { status, user, profile, profileStatus } = useAuth();
  const destination = getAuthRoute(status, user, profileStatus, profile);
  const isSignedIn = destination === 'dashboard' || destination === 'profile-error';
  const isCheckingSession = destination === 'loading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>HB+ FIT · LIVE PREVIEW</Text>
          <Text style={styles.title}>Quick guide</Text>
          <Text style={styles.intro}>A few notes before you explore.</Text>

          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.number}>01</Text>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Sign in</Text>
                <Text style={styles.stepBody}>
                  Use a verified Google account ending in @hbplus.fit. Other domains are restricted.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.number}>02</Text>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>User access</Text>
                <Text style={styles.stepBody}>
                  Your first sign-in creates a User profile and opens the dashboard.
                </Text>
              </View>
            </View>

            <View style={[styles.step, styles.lastStep]}>
              <Text style={styles.number}>03</Text>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Admin preview</Text>
                <Text style={styles.stepBody}>
                  Ask the project owner to set your role from user to admin in Firestore → users → your profile. It updates automatically.
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isCheckingSession }}
            disabled={isCheckingSession}
            onPress={() => router.push(isSignedIn ? '/dashboard' : '/login')}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isCheckingSession && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isCheckingSession ? 'Checking account…' : isSignedIn ? 'Continue to dashboard' : 'Continue to sign in'}
            </Text>
            <Text accessibilityElementsHidden style={styles.buttonArrow}>
              →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  eyebrow: {
    marginBottom: 12,
    color: Colors.primary,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: { color: Colors.secondary, fontFamily: Fonts.serifBold, fontSize: 36, lineHeight: 44 },
  intro: { marginTop: 8, color: '#655F59', fontFamily: Fonts.sansMedium, fontSize: 16, lineHeight: 24 },
  steps: { marginTop: 32 },
  step: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E3DD',
  },
  lastStep: { borderBottomWidth: 0 },
  number: { width: 28, paddingTop: 2, color: Colors.primary, fontFamily: Fonts.sansMedium, fontSize: 12 },
  stepCopy: { flex: 1, gap: 4 },
  stepTitle: { color: Colors.secondary, fontFamily: Fonts.sansMedium, fontSize: 16, lineHeight: 22 },
  stepBody: { color: '#655F59', fontFamily: Fonts.sansMedium, fontSize: 14, lineHeight: 21 },
  button: {
    minHeight: 52,
    marginTop: 28,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Rounded.md,
    backgroundColor: Colors.primary,
  },
  buttonPressed: { opacity: 0.86 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: Fonts.sansMedium, fontSize: 15 },
  buttonArrow: { color: '#FFFFFF', fontSize: 19 },
});

import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Fonts, Rounded } from '../constants/theme';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 480;
  const isTiny = width < 360;
  const shellWidth = Math.max(0, Math.min(width - 40, isWide ? 1120 : 440));
  const { status, error, isSigningIn, signInWithGoogle } = useAuth();
  const isBusy = status === 'loading' || isSigningIn;
  const loadingLabel = status === 'loading' ? 'Checking your session…' : 'Connecting to Google…';

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.shell, { width: shellWidth }, isWide && styles.wideShell]}>
          <View style={[styles.intro, isWide && styles.wideIntro]}>
            <BrandLogo />
            <View style={[styles.introCopy, isWide && styles.wideIntroCopy]}>
              <Text style={[styles.heading, isWide && styles.wideHeading, isNarrow && styles.narrowHeading, isTiny && styles.tinyHeading]} accessibilityRole="header">
                Sign in to HB+ Fit.
              </Text>
              <Text style={[styles.introDescription, isWide && styles.wideIntroDescription]}>
                Use your verified @hbplus.fit Google account.
              </Text>
            </View>
          </View>

          {isWide ? (
            <View style={styles.sectionDivider} accessible={false}>
              {[0.08, 0.2, 0.4, 0.65, 0.85, 0.95].map((opacity, index) => (
                <View key={`top-${index}`} style={[styles.sectionDividerFade, { opacity }]} />
              ))}
              <View style={styles.sectionDividerAccent} />
              {[0.95, 0.85, 0.65, 0.4, 0.2, 0.08].map((opacity, index) => (
                <View key={`bottom-${index}`} style={[styles.sectionDividerFade, { opacity }]} />
              ))}
            </View>
          ) : null}

          <View style={[styles.card, isNarrow && styles.narrowCard]}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !isBusy && styles.buttonPressed,
                isBusy && styles.buttonBusy,
              ]}
              onPress={signInWithGoogle}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={isBusy ? loadingLabel : 'Sign in with Google'}
              accessibilityState={{ disabled: isBusy, busy: isBusy }}
            >
              {isBusy ? (
                <>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.buttonBusyText}>{loadingLabel}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.googleMark} accessible={false}>G</Text>
                  <Text style={styles.buttonText}>Continue with Google</Text>
                </>
              )}
            </Pressable>

            {error ? (
              <View style={styles.errorBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Text style={styles.errorTitle}>Sign-in issue</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.accessNote}>
              <View style={styles.noteRule} />
              <Text style={styles.noteText}>
                Access is limited to verified @hbplus.fit accounts.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dividerColor = '#A4472B';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  shell: { alignSelf: 'center', gap: 30 },
  wideShell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 32 },
  intro: { width: '100%', alignItems: 'center' },
  wideIntro: { flex: 1, maxWidth: 500, alignItems: 'center' },
  introCopy: { width: '100%', alignItems: 'center', marginTop: 30 },
  wideIntroCopy: { alignItems: 'center', marginTop: 40 },
  sectionDivider: { width: 3, height: 240, flexShrink: 0, borderRadius: Rounded.full, overflow: 'hidden' },
  sectionDividerFade: { height: 10, backgroundColor: dividerColor },
  sectionDividerAccent: { height: 120, backgroundColor: dividerColor },
  heading: { width: '100%', maxWidth: 500, fontFamily: Fonts.serifBold, fontSize: 42, lineHeight: 50, letterSpacing: -0.35, color: Colors.onSurface, textAlign: 'center' },
  wideHeading: { fontSize: 51, lineHeight: 61, textAlign: 'center' },
  narrowHeading: { fontSize: 36, lineHeight: 43 },
  tinyHeading: { fontSize: 32, lineHeight: 39 },
  introDescription: { width: '100%', maxWidth: 390, marginTop: 12, fontFamily: Fonts.sansRegular, fontSize: 16, lineHeight: 24, color: '#625B54', textAlign: 'center' },
  wideIntroDescription: { textAlign: 'center' },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', padding: 24, borderRadius: Rounded.lg, borderWidth: 1, borderColor: '#E5DED4', backgroundColor: Colors.neutral },
  narrowCard: { padding: 20 },
  button: { width: '100%', minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#D8C6BC', backgroundColor: Colors.neutral },
  buttonPressed: { backgroundColor: '#F8F1ED' },
  buttonBusy: { backgroundColor: '#FAF8F5' },
  googleMark: { fontFamily: Fonts.sansBold, fontSize: 20, color: '#4285F4' },
  buttonText: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.onSurface },
  buttonBusyText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: '#5D554D' },
  errorBox: { padding: 14, marginTop: 16, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#F0C8BF', backgroundColor: '#FFF6F3' },
  errorTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.error, marginBottom: 3 },
  errorText: { fontFamily: Fonts.sansRegular, fontSize: 13, lineHeight: 19, color: '#73382F' },
  accessNote: { alignItems: 'center', marginTop: 20 },
  noteRule: { width: '100%', height: 1, backgroundColor: '#EEEAE3', marginBottom: 14 },
  noteText: { width: '100%', fontFamily: Fonts.sansRegular, fontSize: 12, lineHeight: 18, color: '#77716A', textAlign: 'center' },
});

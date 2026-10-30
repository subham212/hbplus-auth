import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Fonts, Rounded, Spacing } from '../constants/theme';

export default function LoginScreen() {
  const { status, error, isSigningIn, signInWithGoogle } = useAuth();
  const isBusy = status === 'loading' || isSigningIn;
  const loadingLabel = status === 'loading' ? 'Checking your session…' : 'Connecting to Google…';

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>HB+</Text>
            </View>
            <View>
              <Text style={styles.brandName}>HB+ WORKSPACE</Text>
              <Text style={styles.brandCaption}>TEAM ACCESS</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>OFFICIAL ACCOUNT REQUIRED</Text>
            </View>

            <Text style={styles.heading} accessibilityRole="header">
              Welcome to your workspace.
            </Text>
            <Text style={styles.description}>
              Sign in with your HB+ work account to continue securely.
            </Text>

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
                  <Text style={styles.buttonTextBusy}>{loadingLabel}</Text>
                </>
              ) : (
                <>
                  <View style={styles.googleMark} accessible={false}>
                    <Text style={styles.googleMarkText}>G</Text>
                  </View>
                  <Text style={styles.buttonText}>Continue with Google</Text>
                </>
              )}
            </Pressable>

            {error ? (
              <View
                style={styles.errorBox}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.errorTitle}>Sign-in issue</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.divider} />
            <Text style={styles.cardFootnote}>
              Access is limited to verified @hbplus.fit accounts.
            </Text>
          </View>

          <Text style={styles.footer}>A secure space for the HB+ team.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: Rounded.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  brandMarkText: {
    fontFamily: Fonts.serifBold,
    fontSize: 20,
    color: Colors.neutral,
  },
  brandName: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    letterSpacing: 1.1,
    color: Colors.onSurface,
  },
  brandCaption: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Colors.primary,
    marginTop: 3,
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: Rounded.xl,
    backgroundColor: Colors.neutral,
    borderWidth: 1,
    borderColor: '#EAE5DC',
    shadowColor: '#352318',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 3,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 20,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: Rounded.full,
    backgroundColor: Colors.primary,
  },
  eyebrowText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.primary,
  },
  heading: {
    fontFamily: Fonts.serifBold,
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: -0.4,
    color: Colors.onSurface,
  },
  description: {
    fontFamily: Fonts.sansRegular,
    fontSize: 15,
    lineHeight: 23,
    color: '#66615B',
    marginTop: 12,
    marginBottom: 28,
  },
  button: {
    minHeight: 58,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#D9D4CC',
    backgroundColor: Colors.neutral,
  },
  buttonPressed: {
    backgroundColor: '#F8F6F2',
  },
  buttonBusy: {
    backgroundColor: '#F8F6F2',
  },
  googleMark: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkText: {
    fontFamily: Fonts.sansBold,
    fontSize: 19,
    color: '#4285F4',
  },
  buttonText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  buttonTextBusy: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: '#5D554D',
  },
  errorBox: {
    padding: 14,
    marginTop: 16,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#F0C8BF',
    backgroundColor: '#FFF6F3',
  },
  errorTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.error,
    marginBottom: 3,
  },
  errorText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#73382F',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEAE3',
    marginTop: 24,
    marginBottom: 16,
  },
  cardFootnote: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
    color: '#77716A',
    textAlign: 'center',
  },
  footer: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: '#77716A',
    textAlign: 'center',
    marginTop: 24,
  },
});

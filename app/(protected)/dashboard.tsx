import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts, Rounded, Spacing } from '../../constants/theme';

export default function DashboardScreen() {
  const { profile, error, isSigningOut, signOut } = useAuth();
  const name = profile?.displayName?.trim() || 'Team member';
  const initial = name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.nav}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>HB+</Text>
              </View>
              <View>
                <Text style={styles.brandName}>HB+ WORKSPACE</Text>
                <Text style={styles.brandCaption}>TEAM ACCESS</Text>
              </View>
            </View>

            <Pressable
              onPress={signOut}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && !isSigningOut && styles.logoutPressed,
                isSigningOut && styles.logoutBusy,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isSigningOut ? 'Signing out' : 'Sign out'}
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.logoutText}>Sign out</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.main}>
            <Text style={styles.eyebrow}>YOUR TEAM SPACE</Text>
            <Text style={styles.heading} accessibilityRole="header">
              Welcome back, {name}.
            </Text>
            <Text style={styles.description}>
              You’re signed in with your verified CUTM account.
            </Text>

            <View style={styles.profileCard}>
              {profile?.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  style={styles.avatar}
                  accessibilityLabel={`${name}'s profile picture`}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]} accessible={false}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}

              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.verifiedBadge}>
                  <View style={styles.verifiedDot} />
                  <Text style={styles.verifiedText}>Verified CUTM account</Text>
                </View>
                <Text style={styles.roleLabel}>
                  Role: {profile?.role === 'admin' ? 'Admin' : 'User'}
                </Text>
                {profile?.role === 'admin' ? (
                  <Pressable
                    onPress={() => router.push('/admin')}
                    style={styles.adminLink}
                    accessibilityRole="button"
                    accessibilityLabel="Open admin team directory"
                  >
                    <Text style={styles.adminLinkText}>Open team directory</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {error ? (
              <View
                style={styles.errorBox}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
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
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    flex: 1,
  },
  nav: {
    minHeight: 78,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED4',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: Rounded.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  brandMarkText: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.neutral,
  },
  brandName: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.9,
    color: Colors.onSurface,
  },
  brandCaption: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.primary,
    marginTop: 3,
  },
  logoutButton: {
    minWidth: 84,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#D8C6BC',
    backgroundColor: Colors.neutral,
  },
  logoutPressed: {
    backgroundColor: '#F8F1ED',
  },
  logoutBusy: {
    backgroundColor: '#F8F6F2',
  },
  logoutText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  main: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingTop: 56,
  },
  eyebrow: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: Colors.primary,
  },
  heading: {
    fontFamily: Fonts.serifBold,
    fontSize: 38,
    lineHeight: 46,
    color: Colors.onSurface,
    marginTop: 10,
  },
  description: {
    fontFamily: Fonts.sansRegular,
    fontSize: 15,
    lineHeight: 23,
    color: '#66615B',
    marginTop: 8,
    marginBottom: 28,
  },
  profileCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 24,
    borderRadius: Rounded.xl,
    borderWidth: 1,
    borderColor: '#EAE5DC',
    backgroundColor: Colors.neutral,
    shadowColor: '#352318',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 2,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: Rounded.full,
    backgroundColor: '#EFE8DF',
    flexShrink: 0,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary80,
  },
  avatarInitial: {
    fontFamily: Fonts.serifBold,
    fontSize: 30,
    color: Colors.neutral,
  },
  profileDetails: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  email: {
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: '#625B54',
    marginTop: 3,
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    borderRadius: Rounded.full,
    backgroundColor: '#F1F6F0',
  },
  verifiedDot: {
    width: 7,
    height: 7,
    borderRadius: Rounded.full,
    backgroundColor: '#45834A',
  },
  verifiedText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: '#35663A',
  },
  roleLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: '#625B54',
    marginTop: 10,
  },
  adminLink: {
    minHeight: 42,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  adminLinkText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  errorBox: {
    padding: 14,
    marginTop: 16,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#F0C8BF',
    backgroundColor: '#FFF6F3',
  },
  errorText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#73382F',
  },
  footer: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: '#77716A',
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 36,
  },
});

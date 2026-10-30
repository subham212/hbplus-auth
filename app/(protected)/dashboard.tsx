import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../../components/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts, Rounded, Spacing } from '../../constants/theme';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 420;
  const { profile, error, isSigningOut, signOut } = useAuth();
  const name = profile?.displayName?.trim() || 'Team member';
  const initial = name.charAt(0).toUpperCase();
  const isAdmin = profile?.role === 'admin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.nav}>
            <BrandLogo size={40} />
            <Pressable
              onPress={signOut}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && !isSigningOut && styles.signOutPressed,
                isSigningOut && styles.signOutBusy,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isSigningOut ? 'Signing out' : 'Sign out'}
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.signOutText}>Sign out</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.main}>
            <Text style={styles.eyebrow}>ACCOUNT DETAILS</Text>
            <Text style={[styles.heading, isNarrow && styles.narrowHeading]} accessibilityRole="header">
              Your HB+ Fit account
            </Text>
            <Text style={styles.description}>
              You’re signed in with a verified university account.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>YOUR DETAILS</Text>
              <View style={styles.profileRow}>
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
                  <Text style={styles.email} selectable>{profile?.email}</Text>
                  <View style={[styles.roleBadge, isAdmin && styles.adminBadge]}>
                    <Text style={[styles.roleText, isAdmin && styles.adminRoleText]}>
                      {isAdmin ? 'Admin' : 'User'}
                    </Text>
                    <Text style={styles.verifiedMark} accessibilityLabel="Verified university account">✓</Text>
                  </View>
                </View>
              </View>

              {isAdmin ? (
                <Pressable
                  onPress={() => router.push('/admin')}
                  style={styles.adminLink}
                  accessibilityRole="button"
                  accessibilityLabel="Open the team directory"
                >
                  <Text style={styles.adminLinkText}>Open team directory</Text>
                  <Text style={styles.adminLinkArrow} accessible={false}>→</Text>
                </Pressable>
              ) : null}
            </View>

            {error ? (
              <View style={styles.errorBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1, paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
  container: { width: '100%', maxWidth: 1040, alignSelf: 'center', flex: 1 },
  nav: { minHeight: 76, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5DED4', gap: 12 },
  signOutButton: { minWidth: 88, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#D8C6BC', backgroundColor: 'transparent' },
  signOutPressed: { backgroundColor: '#F8F1ED' },
  signOutBusy: { backgroundColor: Colors.neutral },
  signOutText: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.primary },
  main: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingTop: Spacing.lg },
  eyebrow: { fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 1.2, color: Colors.primary },
  heading: { marginTop: 10, fontFamily: Fonts.serifBold, fontSize: 35, lineHeight: 42, letterSpacing: -0.28, color: Colors.onSurface },
  narrowHeading: { fontSize: 30, lineHeight: 38 },
  description: { marginTop: 8, marginBottom: 28, fontFamily: Fonts.sansRegular, fontSize: 16, lineHeight: 24, color: '#625B54' },
  card: { padding: 24, borderRadius: Rounded.lg, borderWidth: 1, borderColor: '#E5DED4', backgroundColor: Colors.neutral },
  cardLabel: { marginBottom: 20, fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 1.1, color: '#77716A' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatar: { width: 64, height: 64, borderRadius: Rounded.full, backgroundColor: '#EFE8DF', flexShrink: 0 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary90 },
  avatarInitial: { fontFamily: Fonts.serifBold, fontSize: 26, color: Colors.primary },
  profileDetails: { flex: 1, minWidth: 0 },
  profileName: { fontFamily: Fonts.sansSemiBold, fontSize: 17, lineHeight: 24, color: Colors.onSurface },
  email: { marginTop: 2, fontFamily: Fonts.sansRegular, fontSize: 14, lineHeight: 21, color: '#625B54' },
  roleBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: Rounded.full, backgroundColor: Colors.surface },
  adminBadge: { backgroundColor: '#F8EEE9' },
  roleText: { fontFamily: Fonts.sansMedium, fontSize: 11, color: '#5D554D' },
  adminRoleText: { color: Colors.primary },
  verifiedMark: { fontFamily: Fonts.sansMedium, fontSize: 11, lineHeight: 13, color: Colors.primary },
  adminLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 16, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#D8C6BC', backgroundColor: Colors.neutral },
  adminLinkText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.primary },
  adminLinkArrow: { fontSize: 18, color: Colors.primary },
  errorBox: { padding: 14, marginTop: 16, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#F0C8BF', backgroundColor: '#FFF6F3' },
  errorText: { fontFamily: Fonts.sansRegular, fontSize: 13, lineHeight: 19, color: '#73382F' },
});

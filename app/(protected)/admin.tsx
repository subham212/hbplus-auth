import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Rounded, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfilePage, type UserProfile } from '../../services/userProfiles';
import { canAccessAdmin } from '../../utils/authAccess';

export default function AdminScreen() {
  const { user, profile, status, profileStatus, signOut, isSigningOut, error: authError } = useAuth();
  const allowed = canAccessAdmin(status, user, profileStatus, profile);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    setLoading(true);
    setError(null);
    setProfiles([]);
    setCursor(null);
    setHasMore(false);

    void getUserProfilePage()
      .then((page) => {
        if (!active) return;
        setProfiles(page.profiles);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      })
      .catch(() => {
        if (active) setError('The team directory could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore || requestInProgress.current) return;
    requestInProgress.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getUserProfilePage(cursor);
      setProfiles((current) => [...current, ...page.profiles]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      setError('The next team members could not be loaded. Please try again.');
    } finally {
      requestInProgress.current = false;
      setLoadingMore(false);
    }
  }, [cursor, hasMore]);

  if (!allowed) return <Redirect href="/dashboard" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.replace('/dashboard')}
              accessibilityRole="button"
              accessibilityLabel="Return to dashboard"
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Dashboard</Text>
            </Pressable>
            <Pressable
              onPress={signOut}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
              style={styles.signOutButton}
            >
              {isSigningOut ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.signOutText}>Sign out</Text>}
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>ADMINISTRATION</Text>
          <Text style={styles.heading} accessibilityRole="header">Team directory</Text>
          <Text style={styles.description}>
            View the saved profiles for verified CUTM users.
          </Text>
          {authError ? <Text style={styles.inlineError} accessibilityRole="alert">{authError}</Text> : null}

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={Colors.primary} accessibilityLabel="Loading team members" />
              <Text style={styles.stateText}>Loading team members…</Text>
            </View>
          ) : error && profiles.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText} accessibilityRole="alert">{error}</Text>
              <Pressable onPress={() => setReloadKey((key) => key + 1)} style={styles.retryButton} accessibilityRole="button">
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : profiles.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>No team profiles yet.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {profiles.map((member) => (
                <View key={member.uid} style={styles.memberRow}>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.displayName || 'Team member'}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, member.role === 'admin' && styles.adminBadge]}>
                    <Text style={[styles.roleText, member.role === 'admin' && styles.adminRoleText]}>
                      {member.role === 'admin' ? 'Admin' : 'User'}
                    </Text>
                  </View>
                </View>
              ))}

              {error ? <Text style={styles.inlineError} accessibilityRole="alert">{error}</Text> : null}
              {hasMore ? (
                <Pressable
                  onPress={loadMore}
                  disabled={loadingMore}
                  style={styles.moreButton}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loadingMore, busy: loadingMore }}
                >
                  {loadingMore ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.moreText}>Load more</Text>}
                </Pressable>
              ) : null}
            </View>
          )}
          <Text style={styles.footer}>Profile roles are managed by the Firebase project owner.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1, padding: Spacing.sm },
  container: { width: '100%', maxWidth: 880, alignSelf: 'center', flex: 1 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5DED4', marginBottom: 40 },
  backButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  backText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.primary },
  signOutButton: { minWidth: 84, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderRadius: Rounded.md, borderWidth: 1, borderColor: '#D8C6BC', backgroundColor: Colors.neutral },
  signOutText: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.primary },
  eyebrow: { fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 1.3, color: Colors.primary },
  heading: { fontFamily: Fonts.serifBold, fontSize: 36, lineHeight: 44, color: Colors.onSurface, marginTop: 8 },
  description: { fontFamily: Fonts.sansRegular, fontSize: 14, lineHeight: 22, color: '#66615B', marginTop: 6, marginBottom: 24 },
  list: { borderWidth: 1, borderColor: '#EAE5DC', borderRadius: Rounded.xl, backgroundColor: Colors.neutral, overflow: 'hidden' },
  memberRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEEAE3' },
  memberDetails: { flex: 1, minWidth: 0 },
  memberName: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.onSurface },
  memberEmail: { fontFamily: Fonts.sansRegular, fontSize: 12, color: '#625B54', marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Rounded.full, backgroundColor: '#F1F3F4' },
  adminBadge: { backgroundColor: '#F8EEE9' },
  roleText: { fontFamily: Fonts.sansMedium, fontSize: 11, color: '#5D554D' },
  adminRoleText: { color: Colors.primary },
  stateBox: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, borderWidth: 1, borderColor: '#EAE5DC', borderRadius: Rounded.xl, backgroundColor: Colors.neutral },
  stateText: { fontFamily: Fonts.sansRegular, fontSize: 14, lineHeight: 21, color: '#625B54', textAlign: 'center' },
  retryButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 16 },
  retryText: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.primary },
  inlineError: { padding: 16, fontFamily: Fonts.sansRegular, fontSize: 13, color: Colors.error },
  moreButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', margin: 12, borderWidth: 1, borderColor: '#D8C6BC', borderRadius: Rounded.md },
  moreText: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.primary },
  footer: { fontFamily: Fonts.sansRegular, fontSize: 12, lineHeight: 18, color: '#77716A', textAlign: 'center', marginTop: 'auto', paddingTop: 36 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  StatusBar,
  Pressable,
  Image,
  TextInput
} from 'react-native';
import { auth, db, signOut } from '../firebase';
import { useFocusEffect } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { useReviewStats } from '../utils/useReviewStats';
import { useSavedPlaces } from '../utils/useSavedPlaces';
import { useSpots } from '../utils/useSpots';
import { cx } from '../utils/cloudinary';
import { biometricStatus, biometricEnabled, setBiometricEnabled, authenticate } from '../utils/biometric';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { accentLabel, useAccentName } from '../lib/accent';
import { useUser } from '../UserContext';
import BottomSheetModal from '../components/BottomSheetModal';
import { enableNotifications, disableNotifications } from '../utils/notifications';

const SettingsScreen = () => {
  const { isDarkMode, colors, colorScheme } = useTheme();
  const { colors: full } = useColorScheme();
  const accentName = useAccentName();
  const { profile } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [delVisible, setDelVisible] = useState(false);
  const [delPassword, setDelPassword] = useState('');
  const [delError, setDelError] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state change in App.js switches to the login stack automatically.
    } catch (error) {
      console.error("Logout Error:", error.message);
    } finally {
      setModalVisible(false);
    }
  };

  // The stored preference on the user's Firestore document is the source of
  // truth, so the toggle survives restarts instead of living in local state.
  useEffect(() => {
    setNotificationsEnabled(profile?.notificationsEnabled === true);
  }, [profile?.notificationsEnabled]);

  const handleToggleNotifications = async (value) => {
    if (notificationsBusy) return;
    setNotificationsBusy(true);
    try {
      if (value) {
        const result = await enableNotifications();
        if (result.ok) {
          setNotificationsEnabled(true);
        } else {
          Alert.alert(
            'Notifications blocked',
            'Allow notifications for SeeBu in your device settings, then try again.'
          );
          setNotificationsEnabled(false);
        }
      } else {
        await disableNotifications();
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Notification preference error:', error?.message);
      Alert.alert('Notifications', 'Could not update notification settings. Please try again.');
      setNotificationsEnabled(profile?.notificationsEnabled === true);
    } finally {
      setNotificationsBusy(false);
    }
  };

  // ponytail: re-auth FIRST so a stale session can never half-wipe.
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      setDelError('No signed-in email found.');
      return;
    }
    if (!delPassword) {
      setDelError('Enter your password to confirm.');
      return;
    }
    setDelBusy(true);
    setDelError('');
    let wiped = false;
    try {
      const cred = EmailAuthProvider.credential(user.email, delPassword);
      await reauthenticateWithCredential(user, cred);
      const snap = await getDocs(query(collection(db, 'reviews'), where('uid', '==', user.uid)));
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      wiped = true;
      await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});
      await deleteUser(user);
      // Auth guard routes to login; sheet unmounts with the session.
    } catch (e) {
      if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
        setDelError('Wrong password — nothing was deleted.');
      } else if (e?.code === 'auth/requires-recent-login') {
        setDelError(
          wiped
            ? 'Session expired after wiping data — log out and back in, then delete again to finish.'
            : 'Session expired — log out and back in, then retry.'
        );
      } else {
        setDelError(e?.message || 'Could not delete account.');
      }
    } finally {
      setDelBusy(false);
    }
  };

  const { mine, refresh: refreshStats } = useReviewStats();
  const myStats = mine(auth.currentUser?.uid);
  const { savedIds, toggleSave, unsave } = useSavedPlaces();
  const { spots, refresh: refreshSpots } = useSpots();
  const savedSpots = savedIds
    .map((id) => spots.find((s) => Number(s.id) === Number(id)))
    .filter(Boolean);
  // DATA-04: ids with no catalog match = hidden/deleted. Tombstones keep
  // the save count honest and let the user clear them.
  const missingSavedIds = savedIds.filter(
    (id) => !spots.some((s) => Number(s.spotId ?? s.id) === Number(id))
  );
  useFocusEffect(
    React.useCallback(() => {
      refreshStats();
      refreshSpots();
    }, [refreshStats, refreshSpots])
  );
  const [bioState, setBioState] = useState({ checked: false, ok: false, reason: '', on: false });
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      const s = await biometricStatus();
      const on = s.ok ? await biometricEnabled(uid) : false;
      setBioState({ checked: true, ok: s.ok, reason: s.reason || '', on });
    })();
  }, []);

  const handleToggleBio = async (value) => {
    const uid = auth.currentUser?.uid;
    if (!uid || bioBusy) return;
    setBioBusy(true);
    try {
      if (value) {
        // Live check before enabling: no hardware prompt, no toggle.
        const res = await authenticate('Enable biometric unlock');
        if (!res.success) return;
      }
      await setBiometricEnabled(uid, value);
      setBioState((s) => ({ ...s, on: value }));
    } finally {
      setBioBusy(false);
    }
  };
  const displayName =
    profile?.displayName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'Traveller';
  const email = auth.currentUser?.email || 'user@example.com';
  const initial = (auth.currentUser?.email || 'U').charAt(0).toUpperCase();
  const interests = profile?.interests || [];

  // List rows: icon + title + optional sub + chevron/switch. Hairlines, no cards.
  const Row = ({ icon, title, sub, onPress, right, last, danger }) => (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowDivider, { borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.iconBox, { backgroundColor: full.muted }]}>
        <Feather name={icon} size={17} color={danger ? full.destructive : colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: danger ? full.destructive : colors.text }]}>{title}</Text>
        {!!sub && (
          <Text style={[styles.rowSub, { color: colors.subText }]} numberOfLines={1}>{sub}</Text>
        )}
      </View>
      {React.isValidElement(right) ? right : (
        <>
          {right === 'chevron' && <Feather name="chevron-right" size={18} color={colors.subText} />}
          {right === 'switch-notif' && (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              disabled={notificationsBusy}
              trackColor={{ false: full.muted, true: colors.accent }}
              thumbColor={full.primaryForeground}
            />
          )}
          {typeof right === 'string' && right !== 'chevron' && !right.startsWith('switch') && (
            <Text style={[styles.rowValue, { color: colors.subText }]}>{right}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  const SectionLabel = ({ children }) => (
    <Text style={[styles.sectionLabel, { color: colors.subText }]}>{children}</Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, flex: 1 }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* PROFILE HEADER — visual summary only; Profile & Security navigates */}
        <View style={styles.profileHeader}>
          {(profile?.profileImg || auth.currentUser?.photoURL) ? (
            <Image source={{ uri: profile?.profileImg || auth.currentUser?.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: full.accentForeground }]}>{initial}</Text>
            </View>
          )}
          <View style={styles.profileText}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
            <Text style={[styles.userEmail, { color: colors.subText }]} numberOfLines={1}>{email}</Text>
          </View>
        </View>

        {/* STATS — your own activity only */}
        <View style={[styles.stats, { borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{myStats.count}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Reviews</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {myStats.avg != null ? `★ ${myStats.avg.toFixed(1)}` : '—'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Avg given</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{savedIds.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Saved</Text>
          </View>
        </View>

        <SectionLabel>Saved Places</SectionLabel>
        {savedSpots.length > 0 || missingSavedIds.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedRow}>
            {savedSpots.map((s) => (
              <View key={s.id} style={styles.savedCard}>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/spot', params: { spot: JSON.stringify(s) } })}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: cx(s.img, 400) }} style={styles.savedImg} />
                  <Text style={[styles.savedName, { color: colors.text }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleSave(s.id)}
                  style={[styles.savedX, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Feather name="x" size={13} color={colors.subText} />
                </TouchableOpacity>
              </View>
            ))}
            {missingSavedIds.map((id) => (
              <View key={`missing-${id}`} style={styles.savedCard}>
                <View style={[styles.savedImg, { backgroundColor: full.muted, alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name="eye-off" size={20} color={colors.subText} />
                </View>
                <Text style={[styles.savedName, { color: colors.subText }]} numberOfLines={1}>
                  No longer available
                </Text>
                <TouchableOpacity
                  onPress={() => unsave(id)}
                  style={[styles.savedX, { backgroundColor: colors.card, borderColor: colors.border }]}
                  accessibilityLabel="Remove unavailable saved place"
                >
                  <Feather name="x" size={13} color={colors.subText} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.savedEmpty, { color: colors.subText }]}>
            No saved places yet — tap Save on any spot.
          </Text>
        )}

        <SectionLabel>Account</SectionLabel>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row
            icon="user"
            title="Profile & Security"
            sub="Name, photo, email, password"
            onPress={() => router.push('/profile')}
            right="chevron"
            last
          />
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row
            icon="moon"
            title="Appearance"
            sub={`${isDarkMode ? 'Dark' : 'Light'} • ${accentLabel(accentName, colorScheme)}`}
            onPress={() => router.push('/appearance')}
            right="chevron"
          />
          <Row
            icon="bell"
            title="Push Notifications"
            sub={notificationsEnabled ? 'On' : 'Off'}
            right="switch-notif"
          />
        <Row
          icon="heart"
          title="Travel Interests"
          sub={interests.length > 0 ? interests.join(', ') : 'Not set'}
          onPress={() => router.push('/profile')}
          right="chevron"
        />
        <Row
          icon="lock"
          title="Unlock with biometrics"
          sub={!bioState.checked ? 'Checking…' : !bioState.ok ? bioState.reason || 'Not available' : bioState.on ? 'On' : 'Off'}
          right={
            <Switch
              value={bioState.on}
              onValueChange={handleToggleBio}
              disabled={!bioState.ok || bioBusy}
              trackColor={{ false: full.muted, true: colors.accent }}
              thumbColor={full.primaryForeground}
            />
          }
          last
        />
        </View>

        <SectionLabel>Support</SectionLabel>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row
          icon="message-circle"
          title="Travel Assistant"
          sub="Ask about Cebu"
          onPress={() => router.push('/(tabs)/chat')}
          right="chevron"
        />
        <Row
          icon="send"
          title="Contact Us"
          sub="Message the developers"
          onPress={() => router.push('/contact')}
          right="chevron"
        />
        <Row
          icon="info"
          title="About SeeBu"
          sub="The team behind the app"
          onPress={() => router.push('/about')}
          right="chevron"
        />
        <Row
          icon="file-text"
          title="Terms & Privacy"
          onPress={() => router.push('/terms')}
          right="chevron"
          last
        />
        </View>

        <SectionLabel>Session</SectionLabel>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row
            icon="log-out"
            title="Log Out"
            onPress={() => setModalVisible(true)}
            danger
          />
          <Row
            icon="trash-2"
            title="Delete Account"
            sub="Wipes profile and reviews forever"
            onPress={() => { setDelPassword(''); setDelError(''); setDelVisible(true); }}
            danger
            last
          />
        </View>

        <Text style={[styles.versionText, { color: colors.subText }]}>SeeBu v1.0.4 Premium</Text>
      </ScrollView>

      {/* Delete Account Bottom Sheet */}
      <BottomSheetModal
        visible={delVisible}
        onClose={() => { if (!delBusy) setDelVisible(false); }}
        title="Delete account?"
        snapPoints={['75%']}
        initialSnap={0}
        enablePanDownToClose={!delBusy}
      >
        <Text style={[styles.modalSubTitle, { color: colors.subText }]}>
          This permanently wipes your account, profile, and reviews. Guides and spots stay.
        </Text>
        <TextInput
          style={[styles.delInput, { color: colors.text, borderColor: colors.border, backgroundColor: full.muted }]}
          placeholder="Confirm with your password"
          placeholderTextColor={colors.subText}
          secureTextEntry
          value={delPassword}
          onChangeText={setDelPassword}
          autoCapitalize="none"
        />
        {!!delError && <Text style={[styles.delError, { color: full.destructive }]}>{delError}</Text>}
        <View style={styles.modalButtons}>
          <Pressable
            style={[styles.modalButton, { backgroundColor: full.muted }, delBusy && { opacity: 0.6 }]}
            onPress={() => setDelVisible(false)}
            disabled={delBusy}
          >
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, { backgroundColor: full.destructive }, delBusy && { opacity: 0.7 }]}
            onPress={handleDeleteAccount}
            disabled={delBusy}
          >
            <Text style={{ color: full.primaryForeground, fontWeight: 'bold' }}>
              {delBusy ? 'Deleting…' : 'Delete forever'}
            </Text>
          </Pressable>
        </View>
      </BottomSheetModal>

      {/* Logout Confirmation Bottom Sheet */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Wait, leaving so soon?"
        snapPoints={['50%']}
        initialSnap={0}
      >
        <Text style={[styles.modalSubTitle, { color: colors.subText }]}>Are you sure you want to log out of SeeBu?</Text>

        <View style={styles.modalButtons}>
          <Pressable
            style={[styles.modalButton, { backgroundColor: full.muted }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.modalButton, { backgroundColor: colors.accent }]}
            onPress={handleLogout}
          >
            <Text style={{ color: full.accentForeground, fontWeight: 'bold' }}>Yes, Logout</Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 50 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 50 : 20,
    marginBottom: 18,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '900', fontSize: 26 },
  profileText: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 20, fontWeight: '800' },
  userEmail: { fontSize: 13, marginTop: 2 },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 8,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28 },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 22,
    marginBottom: 4,
    marginLeft: 2,
  },
  savedRow: { gap: 12, paddingRight: 4 },
  savedCard: { width: 140 },
  savedImg: { width: 140, height: 90, borderRadius: 12 },
  savedName: { fontSize: 13, fontWeight: '700', marginTop: 6, paddingRight: 20 },
  savedX: {
    position: 'absolute', top: 6, right: 6, width: 26, height: 26,
    borderRadius: 13, borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  savedEmpty: { fontSize: 13, marginLeft: 2, marginBottom: 4 },
  group: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 1 },
  rowValue: { fontSize: 14 },

  versionText: { textAlign: 'center', marginTop: 30, fontSize: 12, fontWeight: '600' },

  delInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52, fontSize: 15 },
  delError: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  modalSubTitle: { fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalButton: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center' }
});

export default SettingsScreen;

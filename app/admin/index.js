import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { db } from '../../firebase';
import { collection, getDocs, getCountFromServer, query, where, orderBy, limit } from 'firebase/firestore';
import { useSpots } from '../../utils/useSpots';
import AdminScreen from '../../components/AdminScreen';

const toMillis = (value) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') {
    const d = value.toDate();
    return d ? d.getTime() : Number.NEGATIVE_INFINITY;
  }
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
};

const formatDate = (value) => {
  const ms = toMillis(value);
  if (ms === Number.NEGATIVE_INFINITY) return 'No date';
  return new Date(ms).toLocaleDateString();
};

const StatCard = ({ icon, label, value, iconColor, colors, full }) => (
  <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={[styles.statIcon, { backgroundColor: full.muted }]}>
      <Feather name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.subText }]}>{label}</Text>
  </View>
);

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const { spots, customs, syncing } = useSpots();
  // DATA-08: counts come from aggregation (1 read each at this scale) and
  // recents from a limit-4 query — the dashboard no longer downloads every
  // user doc + every guide doc on each visit. Docs missing createdAt (older
  // merge-created profiles) are counted but can't appear in recents.
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [guideCount, setGuideCount] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingGuides, setLoadingGuides] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const usersCol = collection(db, 'users');
        const [totalSnap, adminSnap, recentSnap] = await Promise.all([
          getCountFromServer(usersCol),
          getCountFromServer(query(usersCol, where('role', '==', 'admin'))),
          getDocs(query(usersCol, orderBy('createdAt', 'desc'), limit(4))),
        ]);
        setUserCount(totalSnap.data().count);
        setAdminCount(adminSnap.data().count);
        setRecentUsers(recentSnap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      } catch {
        setUserCount(0);
        setAdminCount(0);
        setRecentUsers([]);
      } finally {
        setLoadingUsers(false);
      }
      try {
        const snap = await getCountFromServer(collection(db, 'guides'));
        setGuideCount(snap.data().count);
      } catch {
        setGuideCount(0);
      } finally {
        setLoadingGuides(false);
      }
    };
    load();
  }, []);

  const recentSpots = [...(customs || [])]
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .slice(0, 3);
  const loadingStats = loadingUsers || loadingGuides || syncing;

  return (
    <AdminScreen title="Dashboard">
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionHeader, { color: colors.accent }]}>Overview</Text>
      {loadingStats ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.center} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard icon="users" label="Total Users" value={userCount} iconColor={full.primary} colors={colors} full={full} />
            <StatCard icon="map-pin" label="Spots" value={spots.length} iconColor={colors.accent} colors={colors} full={full} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="book" label="Guides" value={guideCount} iconColor={full.secondary} colors={colors} full={full} />
            <StatCard icon="shield" label="Admins" value={adminCount} iconColor={full.mutedForeground} colors={colors} full={full} />
          </View>
        </>
      )}

      <Text style={[styles.sectionHeader, { color: colors.accent }]}>Recent users</Text>
      {loadingUsers ? (
        <ActivityIndicator color={colors.accent} style={styles.center} />
      ) : recentUsers.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="users" size={28} color={colors.subText} />
          <Text style={[styles.emptyText, { color: colors.subText }]}>No users yet.</Text>
        </View>
      ) : (
        recentUsers.map((u) => (
          <View key={u.uid} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{u.displayName || 'Unknown'}</Text>
              <Text style={[styles.rowSub, { color: colors.subText }]}>{u.email || 'No email'}</Text>
            </View>
            <Text style={[styles.rowDate, { color: colors.subText }]}>{formatDate(u.createdAt)}</Text>
          </View>
        ))
      )}

      <Text style={[styles.sectionHeader, { color: colors.accent }]}>Recent spots</Text>
      {syncing ? (
        <ActivityIndicator color={colors.accent} style={styles.center} />
      ) : recentSpots.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="map-pin" size={28} color={colors.subText} />
          <Text style={[styles.emptyText, { color: colors.subText }]}>No custom spots yet.</Text>
        </View>
      ) : (
        recentSpots.map((s) => (
          <View
            key={String(s._docId || s.spotId)}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{s.title || 'Untitled spot'}</Text>
              {!!s.loc && <Text style={[styles.rowSub, { color: colors.subText }]}>{s.loc}</Text>}
            </View>
            <Text style={[styles.rowDate, { color: colors.subText }]}>{formatDate(s.createdAt)}</Text>
          </View>
        ))
      )}
    </ScrollView>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 16,
    marginLeft: 4,
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowDate: { fontSize: 11, marginLeft: 8 },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16, marginBottom: 10 },
  emptyText: { marginTop: 10, fontSize: 14 },
  center: { marginTop: 24 },
});

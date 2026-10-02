import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { cebuSpots } from '../utils/spots';

const AdminScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { isAdmin, loading: roleLoading } = useUser();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.back();
    }
  }, [isAdmin, roleLoading]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        setUsers(snapshot.docs.map((d) => d.data()));
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  if (roleLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAdmin) return null;

  const adminCount = users.filter((u) => u.role === 'admin').length;

  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.subText }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[styles.headerSub, { color: colors.subText }]}>
            {auth.currentUser?.displayName || 'Administrator'}
          </Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
          <Feather name="shield" size={16} color="#000" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={[styles.sectionHeader, { color: colors.accent }]}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard icon="users" label="Total Users" value={users.length} color="#4fc3f7" />
          <StatCard icon="map-pin" label="Spots Listed" value={cebuSpots.length} color="#f7f200" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="shield" label="Admins" value={adminCount} color="#ff7043" />
          <StatCard icon="user-check" label="Regular Users" value={users.length - adminCount} color="#81c784" />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.accent }]}>Registered Users</Text>
        {loadingUsers ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : users.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="users" size={32} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>No users found</Text>
          </View>
        ) : (
          users.map((user) => (
            <View
              key={user.uid || user.email}
              style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.userAvatar, { backgroundColor: user.role === 'admin' ? colors.accent : colors.border }]}>
                <Text style={styles.userAvatarText}>
                  {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.displayName || 'Unknown'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.subText }]}>{user.email}</Text>
                {user.interests?.length > 0 && (
                  <Text style={[styles.userInterests, { color: colors.subText }]}>
                    {user.interests.join(' · ')}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: user.role === 'admin' ? 'rgba(247,242,0,0.15)' : 'rgba(255,255,255,0.05)' },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: user.role === 'admin' ? colors.accent : colors.subText },
                  ]}
                >
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 50 : 20,
    marginBottom: 24,
    gap: 14,
  },
  backBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 2 },
  adminBadge: { marginLeft: 'auto', width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 8,
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
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  userAvatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontWeight: '900', fontSize: 18, color: '#000' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 2 },
  userInterests: { fontSize: 10, marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800' },
  emptyCard: { alignItems: 'center', padding: 40, borderRadius: 16, marginBottom: 10 },
  emptyText: { marginTop: 10, fontSize: 14 },
});

export default AdminScreen;

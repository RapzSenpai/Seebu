import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { db, auth } from '../../firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import AdminScreen from '../../components/AdminScreen';

const confirmDestructive = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    if (window.confirm(title + '\n\n' + message)) onOk();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onOk },
    ]);
  }
};

export default function AdminUsers() {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Admins first, then alphabetical. Search matches name or email.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? users.filter((u) =>
          ((u.displayName || '') + ' ' + (u.email || '')).toLowerCase().includes(q)
        )
      : [...users];
    return list.sort((a, b) => {
      const ar = a.role === 'admin' ? 0 : 1;
      const br = b.role === 'admin' ? 0 : 1;
      if (ar !== br) return ar - br;
      return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
    });
  }, [users, query]);

  const handleRole = (user, nextRole) => {
    const label = nextRole === 'admin' ? 'Make admin' : 'Make user';
    confirmDestructive(
      label + '?',
      (user.displayName || user.email) + ' will become ' + nextRole + '.',
      async () => {
        setBusyUid(user.uid);
        try {
          await updateDoc(doc(db, 'users', user.uid), { role: nextRole });
          setUsers((prev) =>
            prev.map((u) => (u.uid === user.uid ? { ...u, role: nextRole } : u))
          );
        } catch (e) {
          if (Platform.OS === 'web') {
            window.alert(e.message || 'Role update failed.');
          } else {
            Alert.alert('Update failed', e.message || 'Role update failed.');
          }
        } finally {
          setBusyUid(null);
        }
      }
    );
  };

  const handleDelete = (user) =>
    confirmDestructive(
      'Delete user record?',
      (user.displayName || user.email) +
        ' will be removed from the list. Their login still works; a new record is created on next profile save.',
      async () => {
        setBusyUid(user.uid);
        try {
          await deleteDoc(doc(db, 'users', user.uid));
          setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        } catch (e) {
          if (Platform.OS === 'web') {
            window.alert(e.message || 'Delete failed.');
          } else {
            Alert.alert('Delete failed', e.message || 'Delete failed.');
          }
        } finally {
          setBusyUid(null);
        }
      }
    );

  const renderItem = ({ item }) => {
    const isAdmin = item.role === 'admin';
    const busy = busyUid === item.uid;
    const isSelf = item.uid === auth.currentUser?.uid;
    return (
      <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: isAdmin ? colors.accent : full.muted }]}>
          <Text
            style={[
              styles.avatarText,
              { color: isAdmin ? full.accentForeground : full.mutedForeground },
            ]}
          >
            {(item.displayName || item.email || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.main}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {(item.displayName || 'Unknown') + (isSelf ? ' (you)' : '')}
          </Text>
          <Text style={[styles.email, { color: colors.subText }]} numberOfLines={1}>
            {(item.email || 'No email') + ' • ' + (isAdmin ? 'Admin' : 'User')}
          </Text>
        </View>
        {busy ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : isSelf ? (
          <Text style={[styles.youTag, { color: colors.accent }]}>You</Text>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleRole(item, isAdmin ? 'user' : 'admin')}
              style={[styles.textBtn, { backgroundColor: full.muted }]}
              accessibilityLabel={isAdmin ? 'Remove admin rights' : 'Make admin'}
            >
              <Text style={[styles.textBtnLabel, { color: colors.text }]}>
                {isAdmin ? 'Remove admin' : 'Make admin'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={[styles.textBtn, { backgroundColor: full.destructive }]}
              accessibilityLabel={`Delete ${item.displayName || item.email}`}
            >
              <Text style={[styles.textBtnLabel, { color: full.primaryForeground }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <AdminScreen title="Users">
      <View style={styles.inner}>
      <TextInput
        style={[
          styles.search,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
        ]}
        placeholder="Search name or email"
        placeholderTextColor={colors.subText}
        value={query}
        onChangeText={setQuery}
      />
      <Text style={[styles.helper, { color: colors.subText }]}>
        Deleting removes the record only — the login still works.
      </Text>
      {users.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="users" size={28} color={colors.subText} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No user docs yet</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            Users who registered on web do not get a Firestore doc, so they do not appear here.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Feather name="search" size={28} color={colors.subText} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            No users match this search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      </View>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  list: { paddingBottom: 40 },
  actions: { flexDirection: 'row', gap: 8 },
  textBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  textBtnLabel: { fontSize: 12, fontWeight: '800' },
  youTag: { fontSize: 12, fontWeight: '800' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    marginBottom: 8,
  },
  helper: { fontSize: 12, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontWeight: '900', fontSize: 16 },
  main: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '700' },
  email: { fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 10 },
  emptyText: { fontSize: 13, marginTop: 6, textAlign: 'center' },
});

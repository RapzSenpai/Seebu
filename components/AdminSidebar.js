import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
  Platform, Alert, StatusBar,
} from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';

const DANGER = '#ef4444';
import { auth, db, signOut } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const ADMIN_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
  { href: '/admin/users', label: 'Users', icon: 'people-outline', activeIcon: 'people' },
  { href: '/admin/spots', label: 'Spots', icon: 'location-outline', activeIcon: 'location' },
  { href: '/admin/add-spot', label: 'Add Spot', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { href: '/admin/guides', label: 'Guides', icon: 'book-outline', activeIcon: 'book' },
  { href: '/admin/messages', label: 'Messages', icon: 'mail-outline', activeIcon: 'mail', badge: true },
];

// PERF-02: enabled=false skips the listener. The drawer only needs it
// while open (the menu button shows no badge); the web rail stays on.
export const useUnreadCount = (enabled = true) => {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setUnread(0);
      return;
    }
    const q = query(collection(db, 'inquiries'), where('handled', '==', false));
    const unsub = onSnapshot(q, (snap) => setUnread(snap.size), () => {});
    return unsub;
  }, [enabled]);
  return unread;
};

const doLogout = async () => {
  const confirmed =
    Platform.OS === 'web'
      ? window.confirm('Log out of the admin panel?')
      : await new Promise((resolve) => {
          Alert.alert('Logout', 'Log out of the admin panel?', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Logout', onPress: () => resolve(true) },
          ]);
        });
  if (!confirmed) return;
  try {
    await signOut(auth);
  } catch (e) {
    if (Platform.OS === 'web') window.alert(e.message || 'Unable to log out.');
    else Alert.alert('Logout Failed', e.message || 'Unable to log out.');
  }
};

// Brand block: shield badge + title, then a thin separator.
const SidebarBrand = () => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  return (
    <>
      <View style={styles.brandRow}>
        <View style={[styles.brandBadge, { backgroundColor: colors.accent }]}>
          <Feather name="shield" size={18} color={full.accentForeground} />
        </View>
        <View>
          <Text style={[styles.brand, { color: colors.text }]}>SeeBu Admin</Text>
          <Text style={[styles.brandSub, { color: colors.subText }]}>Management console</Text>
        </View>
      </View>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </>
  );
};

// Each destination gets its own bordered container; the active one goes
// solid accent with foreground icons/text, so nothing ever sits
// tone-on-tone and invisible. Shared by the web rail + native drawer.
const NavList = ({ pathname, unread, onNavigate }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  return (
    <>
      {ADMIN_ITEMS.map((item) => {
        const active = pathname === item.href;
        const fg = active ? full.accentForeground : colors.subText;
        return (
          <TouchableOpacity
            key={item.href}
            onPress={() => onNavigate(item.href)}
            style={[
              styles.item,
              {
                backgroundColor: active ? colors.accent : colors.background,
                borderColor: active ? colors.accent : colors.border,
              },
            ]}
          >
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={20}
              color={fg}
            />
            <Text style={[styles.label, { color: active ? full.accentForeground : colors.subText }]}>
              {item.label}
            </Text>
            {item.badge && unread > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: active ? full.accentForeground : colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: active ? colors.accent : full.accentForeground },
                  ]}
                >
                  {unread > 99 ? '99+' : unread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

// Shared footer: separator, then one bordered container holding Appearance
// (opens the shared page), then a red Logout container — pinned at bottom.
const SidebarFooter = () => {
  const { colors, isDarkMode } = useTheme();
  return (
    <>
      <View style={{ flex: 1 }} />
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View style={[styles.footBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.push('/appearance')}
          style={styles.footItem}
        >
          <Feather name="moon" size={18} color={colors.subText} />
          <Text style={[styles.footLabel, { color: colors.subText }]}>Appearance</Text>
          <Text style={[styles.footValue, { color: colors.subText }]}>
            {isDarkMode ? 'Dark' : 'Light'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={doLogout}
        style={[
          styles.footBox,
          styles.logoutBox,
          { backgroundColor: DANGER + '1A', borderColor: DANGER },
        ]}
      >
        <Feather name="log-out" size={18} color={DANGER} />
        <Text style={[styles.footLabel, { color: DANGER }]}>Logout</Text>
      </TouchableOpacity>
    </>
  );
};

// Web-only fixed admin sidebar. Native gets AdminDrawer below instead.
const AdminSidebar = () => {
  const { colors } = useTheme();
  const pathname = usePathname();
  const unread = useUnreadCount();

  return (
    <View style={[styles.side, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SidebarBrand />
      <NavList pathname={pathname} unread={unread} onNavigate={(href) => router.push(href)} />
      <SidebarFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  side: {
    width: 232, borderRightWidth: 1, paddingTop: 12, paddingHorizontal: 12,
    paddingBottom: 16, height: '100%',
  },
  footBox: { borderWidth: 1, borderRadius: 12, marginBottom: 8 },
  logoutBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  footItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12,
  },
  footLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  footValue: { fontSize: 12, fontWeight: '600' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, marginBottom: 14 },
  brandBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: 17, fontWeight: '900' },
  brandSub: { fontSize: 11, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 12, marginBottom: 14 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '700', flex: 1 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '800' },
});

// Native slide-over drawer for the APK — same items + badge as the web sidebar.
export const AdminDrawer = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const pathname = usePathname();
  const unread = useUnreadCount(visible);

  const go = (href) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={drawerStyles.overlay} onPress={onClose}>
        <Pressable
          style={[drawerStyles.panel, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <SidebarBrand />
          <NavList pathname={pathname} unread={unread} onNavigate={go} />
          <SidebarFooter />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const drawerStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row', justifyContent: 'flex-start',
  },
  panel: {
    width: 264, height: '100%',
    paddingTop: 12 + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    paddingHorizontal: 12, paddingBottom: 16,
  },
});

export default AdminSidebar;

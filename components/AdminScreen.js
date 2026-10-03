import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { AdminDrawer } from './AdminSidebar';

// Shared admin shell: in-flow menu button + title up top, so nothing ever
// sits under a floating button. Same safe-area approach as the user screens:
// RN SafeAreaView (iOS) + StatusBar.currentHeight pad (Android).
const AdminScreen = ({ title, children }) => {
  const { colors, isDarkMode } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AdminDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          accessibilityLabel="Open admin menu"
        >
          <Feather name="menu" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  menuBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  title: { fontSize: 22, fontWeight: '900' },
  body: { flex: 1 },
});

export default AdminScreen;

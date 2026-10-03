import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { accentLabel, useAccentName } from '../lib/accent';

// Shared by user Settings and the admin sidebar: capsule theme switch +
// a Color Combination row leading to the dedicated accent page.
const AppearanceScreen = () => {
  const { colors, isDarkMode, setIsDarkMode, colorScheme } = useTheme();
  const { colors: full } = useColorScheme();
  const accentName = useAccentName();

  const options = [
    { key: 'dark', label: 'Dark' },
    { key: 'light', label: 'Light' },
  ];
  const activeKey = isDarkMode ? 'dark' : 'light';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/settings'))}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Theme</Text>
        <View style={[styles.capsule, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((opt) => {
            const on = activeKey === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setIsDarkMode(opt.key === 'dark')}
                style={[styles.opt, on && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.optText, { color: on ? full.accentForeground : colors.subText }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Colors</Text>
        <TouchableOpacity onPress={() => router.push('/accent')}>
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: full.muted }]}>
              <Feather name="droplet" size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Color Combination</Text>
              <Text style={[styles.rowSub, { color: colors.subText }]} numberOfLines={1}>
                {accentLabel(accentName, colorScheme)}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.subText} />
          </View>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 50 : 20,
    marginBottom: 20,
    gap: 14,
  },
  backBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  content: { paddingBottom: 60 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1.5, marginTop: 8, marginBottom: 10, marginLeft: 2,
  },
  capsule: {
    flexDirection: 'row', borderRadius: 16, borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 4,
  },
  opt: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  optText: { fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
});

export default AppearanceScreen;

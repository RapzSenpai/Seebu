import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { ACCENT_ORDER, accentDot, accentLabel, setAccentName, useAccentName } from '../lib/accent';

// One accent for both modes: swaps the highlight color only. Backgrounds,
// surfaces, and text stay on the Light/Dark tokens, so contrast is safe.
const AccentScreen = () => {
  const { colors, isDarkMode, colorScheme } = useTheme();
  const { colors: full } = useColorScheme();
  const accentName = useAccentName();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/appearance'))}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Color Combination</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.note, { color: colors.subText }]}>
          One highlight color for both Light and Dark. Only buttons, icons, and
          selected states change — backgrounds and text stay as they are.
        </Text>
        {ACCENT_ORDER.map((name) => {
          const on = accentName === name;
          return (
            <TouchableOpacity key={name} onPress={() => setAccentName(name)}>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.card,
                    borderColor: on ? colors.accent : colors.border,
                    borderWidth: on ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: accentDot(colorScheme, name, colors.accent) },
                  ]}
                />
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {accentLabel(name, colorScheme)}
                </Text>
                {on && <Feather name="check" size={18} color={colors.accent} />}
              </View>
            </TouchableOpacity>
          );
        })}
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
  note: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  dot: { width: 28, height: 28, borderRadius: 14 },
  rowTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
});

export default AccentScreen;

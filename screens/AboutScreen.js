import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';

const DEVS = [
  'Marc Lyster Canillo',
  'Andrew Sungkip',
  'Dianna Costanilla',
  'Doven Reyes',
];

const AboutScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>About SeeBu</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.lead, { color: colors.text }]}>
          SeeBu helps travelers discover Cebu — waterfalls, islands, heritage towns, and the guides who know them.
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Developers</Text>
        {DEVS.map((name, i) => (
          <View
            key={name}
            style={[
              styles.devRow,
              i < DEVS.length - 1 && styles.devDivider,
              { borderColor: colors.border },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: full.accentForeground }]}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.devName, { color: colors.text }]}>{name}</Text>
          </View>
        ))}

        <Text style={[styles.note, { color: colors.subText }]}>
          SeeBu was primarily developed as a capstone project by students — an educational,
          non-commercial travel guide for Cebu, Philippines.
        </Text>
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
  lead: { fontSize: 15, lineHeight: 23 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1.5, marginTop: 24, marginBottom: 4, marginLeft: 2,
  },
  devRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  devDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900' },
  devName: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
  note: { fontSize: 13, lineHeight: 21, marginTop: 24 },
});

export default AboutScreen;

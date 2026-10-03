import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';

const SECTIONS = [
  {
    title: 'About SeeBu',
    body:
      'SeeBu is a tourism guide for Cebu made primarily as a student capstone project. It lists destinations with photos, locations, estimated travel expenses, transport guidance, and maps. SeeBu is educational and non-commercial: it is not a booking service and processes no payments.',
  },
  {
    title: 'Accounts & Profile Data',
    body:
      'Accounts use an email address and password (Firebase Authentication). Your profile stores your name, email, optional photo, interests, and saved places, all editable from the Profile screen. You can permanently delete your account, profile, and reviews anytime from Settings > Delete Account.',
  },
  {
    title: 'Reviews & Saved Places',
    body:
      'You may post one review per spot (a 1–5 star rating plus a comment) and update or delete it anytime. Averages shown across the app are computed from real user reviews. Saved places are private to your account.',
  },
  {
    title: 'Location',
    body:
      'The Route tab and Maps ask for your foreground location to show distances, nearby sorting, and your position. Location is read only while you use those screens — SeeBu never tracks you in the background.',
  },
  {
    title: 'Notifications & Biometrics (optional)',
    body:
      'Push notifications and biometric unlock are both opt-in from Settings and can be turned off anytime. Turning notifications off also removes the stored push token. Biometric data never leaves your device.',
  },
  {
    title: 'Local Guides & Bookings',
    body:
      'Guides are local guides recommended and listed by the SeeBu team — not employees or partners. "Call Guide" opens your phone dialer with the guide\u2019s number; you arrange availability and any fee directly with them. SeeBu handles no booking, guarantee, or payment.',
  },
  {
    title: 'Destination Information',
    body:
      'Fares, schedules, and expenses are typical reported ranges and may change. Verify current details locally before travelling. Spot a mistake? Tell us via Settings > Contact Us.',
  },
];

const TermsScreen = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => (router.canGoBack() ? router.back() : null)}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Privacy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={[styles.sectionTitle, { color: colors.accent }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.text }]}>{section.body}</Text>
          </View>
        ))}
        <Text style={[styles.updated, { color: colors.subText }]}>SeeBu v1.0.4 — educational project</Text>
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
  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 18, marginBottom: 6 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  updated: { fontSize: 12, textAlign: 'center', marginTop: 24 },
});

export default TermsScreen;

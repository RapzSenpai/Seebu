import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';

const SECTIONS = [
  {
    title: 'About SeeBu',
    body:
      'SeeBu is an educational travel-guide app for tourist destinations in Cebu. It lists destinations with location, estimated travel expense, and transport guidance. SeeBu is a school/capstone project and is not a commercial travel-booking service.',
  },
  {
    title: 'Accounts & Profile Data',
    body:
      'Accounts are created with an email address and password (handled by Firebase Authentication). Your profile document stores your name, email, an optional profile photo, and the interests you pick during registration. You can view or edit these anytime from the Profile screen.',
  },
  {
    title: 'Location',
    body:
      'When you open a destination\u2019s Route tab, the app asks for your foreground location to show your distance from the spot on the mini-map. Location is only read while you use that screen \u2014 SeeBu does not track you in the background.',
  },
  {
    title: 'Notifications (optional)',
    body:
      'If you turn on notifications in Settings, your device receives a push token that is stored on your profile so travel updates can be delivered to you. You can turn notifications off at any time from Settings, which also removes the stored token.',
  },
  {
    title: 'Local Guides & Bookings',
    body:
      'Local Guides are listed by the SeeBu team. Tapping "Book Guide" opens your phone\u2019s dialer with the guide\u2019s contact number \u2014 you talk and book directly with the guide. SeeBu does not process any payment or booking on its own.',
  },
  {
    title: 'Destination Information',
    body:
      'Fares, schedules, and estimated expenses are guides based on commonly reported ranges and may change. Always verify current details locally before travelling.',
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
          <View
            key={section.title}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.accent }]}>{section.title}</Text>
            <Text style={[styles.cardBody, { color: colors.text }]}>{section.body}</Text>
          </View>
        ))}
        <Text style={[styles.updated, { color: colors.subText }]}>SeeBu v1.0.4 \u2014 educational project</Text>
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
  backBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  content: { paddingBottom: 60 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  cardBody: { fontSize: 14, lineHeight: 22 },
  updated: { fontSize: 12, textAlign: 'center', marginTop: 6 },
});

export default TermsScreen;

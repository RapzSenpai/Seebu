import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserContext';

// ponytail: swap with the real team inbox when ready. Shown + used as the
// mailto target below, so one line changes both.
const CONTACT_EMAIL = 'team@seebu-capstone.app';

const CATEGORIES = ['General', 'Place issue', 'Guide feedback', 'Account help', 'Suggestion'];

const ContactScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const { profile } = useUser();
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  // MSG-02: per-thread "new reply" dot. Seen reply counts live per-account
  // on-device; a thread whose reply count grew since the last visit glows
  // until the next visit. No schema change, no extra reads.
  const [newReplyIds, setNewReplyIds] = useState({});

  // Your past inquiries + admin replies. Refreshes every visit so new
  // replies appear without reinstalling or relogging.
  const loadThreads = async () => {
    const user = auth.currentUser;
    if (!user) {
      setThreads([]);
      setNewReplyIds({});
      setLoadingThreads(false);
      return;
    }
    setLoadingThreads(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'inquiries'), where('uid', '==', user.uid))
      );
      setThreads(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      );
      // Diff reply counts against last visit, then record this visit.
      try {
        const key = `seebu:seenReplies:${user.uid}`;
        const raw = await AsyncStorage.getItem(key);
        const seen = raw ? JSON.parse(raw) : {};
        const fresh = {};
        const next = {};
        snap.docs.forEach((d) => {
          const n = Array.isArray(d.data()?.replies) ? d.data().replies.length : 0;
          next[d.id] = n;
          if (n > 0 && n > (seen[d.id] || 0)) fresh[d.id] = true;
        });
        setNewReplyIds(fresh);
        await AsyncStorage.setItem(key, JSON.stringify(next));
      } catch {
        setNewReplyIds({});
      }
    } catch {
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadThreads();
    }, [])
  );

  const submit = async () => {
    const clean = message.trim();
    if (!clean) {
      setError('Write your message first.');
      return;
    }
    if (clean.length > 1000) {
      setError(`Keep it under 1000 characters (now ${clean.length}).`);
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError('Log in to send a message.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        uid: user.uid,
        displayName:
          profile?.displayName ||
          user.displayName ||
          user.email?.split('@')[0] ||
          'Traveller',
        email: user.email || '',
        category,
        message: clean,
        handled: false,
        createdAt: new Date().toISOString(),
      });
      setMessage('');
      setSent(true);
      loadThreads();
    } catch (e) {
      setError('Could not send — check connection and try again.');
    } finally {
      setBusy(false);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
          <View style={[styles.mailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: full.muted }]}>
              <Feather name="mail" size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mailLabel, { color: colors.subText }]}>Developer email</Text>
              <Text style={[styles.mailValue, { color: colors.text }]}>{CONTACT_EMAIL}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Send a message to the developers</Text>
        <Text style={[styles.fieldLabel, { color: colors.subText }]}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const on = category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  on && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.subText }, on && { color: full.accentForeground }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.subText }]}>Message</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="How can we help?"
          placeholderTextColor={colors.subText}
          multiline
          numberOfLines={5}
          maxLength={1100}
          value={message}
          onChangeText={(t) => { setMessage(t); setSent(false); }}
        />
        {!!error && <Text style={[styles.error, { color: full.destructive }]}>{error}</Text>}
        {sent && (
          <Text style={[styles.sent, { color: colors.accent }]}>
            Sent — the team reads every inquiry.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.accent }, busy && { opacity: 0.7 }]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={full.accentForeground} />
          ) : (
            <Text style={[styles.submitText, { color: full.accentForeground }]}>Submit</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Your messages</Text>
        {loadingThreads ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />
        ) : threads.length === 0 ? (
          <Text style={[styles.threadEmpty, { color: colors.subText }]}>
            Nothing here yet — replies from the team will appear under each message.
          </Text>
        ) : (
          threads.map((t) => {
            const replies = Array.isArray(t.replies) ? t.replies : [];
            return (
              <View
                key={t.id}
                style={[styles.thread, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.threadCat, { color: colors.accent }]}>{t.category || 'General'}</Text>
                  {newReplyIds[t.id] && (
                    <View style={{ marginLeft: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.accent }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: full.accentForeground }}>NEW REPLY</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.threadMsg, { color: colors.text }]}>{t.message}</Text>
                {replies.map((r, i) => (
                  <View key={i} style={[styles.adminReply, { backgroundColor: full.muted }]}>
                    <Text style={[styles.adminBy, { color: colors.accent }]}>SeeBu team</Text>
                    <Text style={[styles.adminText, { color: colors.text }]}>{r.text}</Text>
                  </View>
                ))}
                {replies.length === 0 && (
                  <Text style={[styles.pending, { color: colors.subText }]}>Waiting for a reply…</Text>
                )}
              </View>
            );
          })
        )}
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
  mailRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mailLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  mailValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1.5, marginTop: 24, marginBottom: 4, marginLeft: 2,
  },
  fieldLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15,
    minHeight: 130, textAlignVertical: 'top',
  },
  error: { fontSize: 13, marginTop: 8 },
  sent: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  submit: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  submitText: { fontWeight: '800', fontSize: 16 },
  threadEmpty: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  thread: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 10 },
  threadCat: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  threadMsg: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  adminReply: { borderRadius: 12, padding: 10, marginTop: 8 },
  adminBy: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  adminText: { fontSize: 14, lineHeight: 20 },
  pending: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});

export default ContactScreen;

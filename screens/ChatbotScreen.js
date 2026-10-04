import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Send, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '../lib/useColorScheme';
import { CHAT_DAILY_LIMIT, remainingToday, consumeOne } from '../lib/chatQuota';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import { auth } from '../firebase';
import { fetchAiReply, isAiConfigured } from '../lib/ai';

// ponytail: bot avatar is the same S badge as login/register/welcome —
// one View, follows the live accent, no image asset to theme.
const SBadge = ({ size, radius, fontSize }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
      }}
    >
      <Text style={{ color: full.accentForeground, fontSize, fontWeight: '900' }}>S</Text>
    </View>
  );
};

// Capstone setup: the app talks to Groq directly with a key from .env
// (client-visible by design here — restricted free key, rotate after demo).
// lib/ai.js owns the call. No mock fallback: failures surface the real
// error (banner + error bubble) and never consume quota.

const fmtTime = (t) => {
  const d = t instanceof Date ? t : new Date(t);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatbotScreen = () => {
  // ponytail: empty until the user speaks. No fake greeting pretending the
  // assistant is live — the welcome state below covers first paint.
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  // CHAT-06: evaluated per render, not captured at module load — a key
  // added to .env (then restart, Expo bakes env at bundle time) takes
  // effect without depending on import order.
  const aiReady = isAiConfigured();
  const [aiStatus, setAiStatus] = useState(aiReady ? 'active' : 'missing');
  const [aiError, setAiError] = useState('');
  const scrollViewRef = useRef(null);
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const { profile } = useUser();
  const insets = useSafeAreaInsets();
  // ponytail: measured from the floating tab bar (64 tall, offset
  // max(16, inset+10) from the bottom), not an arbitrary margin.
  const tabClearance = Math.max(16, insets.bottom + 10) + 64 + 4;
  const [leftToday, setLeftToday] = useState(CHAT_DAILY_LIMIT);
  // ponytail: generation guard. Clearing mid-reply bumps this; the late
  // response sees a stale generation and drops itself instead of
  // resurrecting a dead conversation. Same on unmount/remount.
  const genRef = useRef(0);
  // Sync guard: state updates lag rapid double-taps, so the in-flight flag
  // lives in a ref. Prevents double sends → double quota consumption.
  const busyRef = useRef(false);

  useEffect(() => {
    remainingToday(auth.currentUser?.uid).then(setLeftToday);
  }, []);

  // New conversation: wipes messages only. Quota untouched by design —
  // clearing chat never refunds the daily budget.
  const handleClear = () => {
    Alert.alert('New conversation?', 'This clears the messages above. Your daily limit stays as is.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          genRef.current += 1;
          setLoading(false);
          setMessages([]);
        },
      },
    ]);
  };

  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text,
    subtext: colors.subText,
    botBg: full.muted,
    userBg: colors.accent,
    userText: full.accentForeground,
    border: colors.border,
  };

  const userPhoto = profile?.profileImg || auth.currentUser?.photoURL;
  const userInitial = (
    profile?.displayName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    '?'
  ).charAt(0).toUpperCase();

  // Auto-scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // CHAT-03: failures throw the real error — no mock text appended.
  // The banner (CHAT-01) + the error bubble below carry the actual cause.
  const fetchAiResponse = async (text) => {
    if (!aiReady) {
      throw new Error('Assistant is offline — add EXPO_PUBLIC_GROQ_API_KEY to .env and restart.');
    }
    return fetchAiReply(text);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || busyRef.current) return;
    // Guard first, before any await — two taps in the same tick must not
    // both pass. Released on every non-send path below.
    busyRef.current = true;
    // CHAT-02: quota is checked first and consumed only after a real reply.
    // Failures, timeouts, and offline attempts cost nothing.
    const uid = auth.currentUser?.uid;
    let left;
    try {
      left = await remainingToday(uid);
    } catch {
      busyRef.current = false;
      return;
    }
    setLeftToday(left);
    if (left <= 0) {
      busyRef.current = false;
      Alert.alert(
        'Daily limit reached',
        `You've used all ${CHAT_DAILY_LIMIT} messages for today. Your budget refreshes tomorrow — clearing the chat doesn't refund it.`
      );
      return;
    }

    const userText = inputText.trim();
    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    const gen = genRef.current;

    try {
      const botText = await fetchAiResponse(userText);
      // Conversation was cleared (or screen remounted) while waiting —
      // drop the stale reply, don't resurrect.
      if (genRef.current !== gen) return;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: botText,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setAiStatus('active');
      setAiError('');
      await consumeOne(uid);
    } catch (e) {
      if (genRef.current !== gen) return;
      const reason = e?.message || 'Request failed';
      console.warn('AI error:', reason);
      setAiStatus('error');
      setAiError(reason);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I couldn't reach the assistant. ${reason} Your message wasn't counted — try again.`,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      if (genRef.current === gen) setLoading(false);
      busyRef.current = false;
    }
    // Quota display refresh lives outside the AI try/catch: a refresh
    // failure must never paint an error bubble over a successful reply.
    try {
      setLeftToday(await remainingToday(uid));
    } catch {}
  };

  const renderAvatar = (sender) => {
    if (sender === 'bot') {
      return <SBadge size={32} radius={16} fontSize={16} />;
    }
    if (userPhoto) {
      return <Image source={{ uri: userPhoto }} style={styles.avatar} />;
    }
    return (
      <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.accent }]}>
        <Text style={[styles.avatarText, { color: full.accentForeground }]}>{userInitial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <SBadge size={40} radius={20} fontSize={20} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Assistant</Text>
            <Text style={[styles.headerSub, { color: theme.subtext }]}>Ask about Cebu</Text>
          </View>
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.newBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            accessibilityLabel="Start new conversation"
          >
            <Plus size={18} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        {/* CHAT-01: the AI error state was set but never rendered — every
            failure looked identical. Missing key gets a setup hint. */}
        {!aiReady ? (
          <View style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, backgroundColor: `${colors.accent}1A` }}>
            <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>
              Assistant is offline — add EXPO_PUBLIC_GROQ_API_KEY to .env and restart to enable live replies.
            </Text>
          </View>
        ) : aiStatus === 'error' && !!aiError ? (
          <View style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, backgroundColor: `${full.destructive}1A` }}>
            <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>
              Assistant error: {aiError}
            </Text>
          </View>
        ) : null}

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && !loading && (
            <View style={styles.empty}>
              <SBadge size={84} radius={24} fontSize={42} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Where to in Cebu?
              </Text>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                Ask about destinations, tourist spots, local guides, or the app
                itself — once the assistant is connected, answers appear here.
              </Text>
            </View>
          )}
          {messages.map(message => {
            const isUser = message.sender === 'user';
            return (
              <View
                key={message.id}
                style={[styles.row, isUser ? styles.userRow : styles.botRow]}
              >
                {!isUser && renderAvatar('bot')}
                <View style={[styles.bubbleCol, isUser && styles.bubbleColUser]}>
                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: theme.userBg }]
                        : [styles.botBubble, { backgroundColor: theme.botBg }]
                    ]}
                  >
                    {isUser ? (
                      <Text style={[styles.messageText, { color: theme.userText }]}>
                        {message.text}
                      </Text>
                    ) : (
                      <Markdown
                        style={{
                          body: { color: theme.text, fontSize: 14.5, lineHeight: 21 },
                          strong: { fontWeight: '800' },
                          em: { fontStyle: 'italic' },
                          bullet_list: { marginVertical: 4 },
                          list_item: { marginVertical: 2 },
                          code_inline: {
                            backgroundColor: theme.border,
                            borderRadius: 6,
                            paddingHorizontal: 5,
                            paddingVertical: 1,
                            fontSize: 13,
                          },
                          fence: {
                            backgroundColor: theme.border,
                            borderRadius: 8,
                            padding: 8,
                            fontSize: 13,
                          },
                        }}
                      >
                        {message.text}
                      </Markdown>
                    )}
                  </View>
                  {!!message.timestamp && (
                    <Text style={[styles.time, { color: theme.subtext }]}>
                      {fmtTime(message.timestamp)}
                    </Text>
                  )}
                </View>
                {isUser && renderAvatar('user')}
              </View>
            );
          })}

          {loading && (
            <View style={styles.botRow}>
              {renderAvatar('bot')}
              <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: theme.botBg }]}>
                <ActivityIndicator size="small" color={theme.subtext} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputWrap, { paddingBottom: tabClearance }]}>
          <Text style={[styles.quota, { color: theme.subtext }]}>
            {leftToday > 0 ? `${leftToday} left today` : 'Fresh batch tomorrow'}
          </Text>
          <View style={[styles.inputBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ask about Cebu…"
              placeholderTextColor={theme.subtext}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              // CHAT-07: explicit send action (keyboard send key submits,
              // keyboard stays up for follow-ups); quota-exhausted taps get
              // the explainer Alert instead of a dead button.
              returnKeyType="send"
              blurOnSubmit={false}
              submitBehavior="submit"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.userBg,
                  opacity: inputText.trim() && !loading ? 1 : 0.5,
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading}
              accessibilityLabel="Send message"
            >
              <Send size={18} color={theme.userText} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  newBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 16, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptyText: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '900', fontSize: 15 },
  bubbleCol: { maxWidth: '75%' },
  bubbleColUser: { alignItems: 'flex-end' },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 6 },
  botBubble: { borderBottomLeftRadius: 6 },
  messageText: { fontSize: 14.5, lineHeight: 21 },
  time: { fontSize: 10, marginTop: 4, marginHorizontal: 4 },
  inputWrap: { paddingHorizontal: 12, paddingTop: 8 },
  quota: { fontSize: 11, textAlign: 'center', marginBottom: 6 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    borderWidth: 1, borderRadius: 28, paddingLeft: 16, paddingRight: 6,
    paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  input: { flex: 1, maxHeight: 100, fontSize: 15, paddingVertical: 8 },
  sendButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});

export default ChatbotScreen;

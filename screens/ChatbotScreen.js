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
// lib/ai.js owns the call; the mock below stays as the offline fallback.
const USE_AI_PROXY = isAiConfigured();

const choose = (options) => options[Math.floor(Math.random() * options.length)];

// Mock fallback chatbot intelligence: Cebu-specific answers and topic matching
const generateBotResponse = (text) => {
  const lower = text.toLowerCase().trim();

  if (/(where is cebu|where is it located|where is the philippines|what is cebu|cebu located)/.test(lower)) {
    return choose([
      'Cebu is an island province in the Central Visayas region of the Philippines, known for beaches, waterfalls, and historic sites.',
      'Cebu is in the Philippines, in the Central Visayas region. It is famous for its islands, diving spots, and local lechon.',
    ]);
  }

  if (/(hello|hi|hey|good morning|good afternoon|good evening)/.test(lower)) {
    return choose([
      "Hello! 👋 I'm your SeeBu travel guide. I can help you find beaches, waterfalls, food spots, transport, and more around Cebu.",
      "Hi there! I can help you explore Cebu's attractions, food, travel, and accommodation. What would you like to know?",
    ]);
  }

  if (/(tell me about cebu|what can you do|help me|assist me|i need help)/.test(lower)) {
    return choose([
      'I can help you find beaches, waterfalls, restaurants, hotels, and transport options in Cebu. Just ask me a question about your trip.',
      'Ask me about Cebu attractions, how to get there, where to eat, or what to do on a day trip and I will give you local advice.',
    ]);
  }

  if (/(beach|beaches|snorkel|dive|moalboal|mactan|malapascua|white sand|seaside)/.test(lower)) {
    return choose([
      'Cebu has amazing beaches. For snorkeling, try Moalboal. If you want resort life near the airport, Mactan Island is perfect. Want a beach with good food and nightlife? I can recommend one.',
      'If you love beaches, Mactan and Moalboal are great choices. You can also visit Malapascua for diving and white sand beaches for relaxing.',
    ]);
  }

  if (/(waterfall|falls|kawasan|tumalog|oslob|kantabogon|canyoneering)/.test(lower)) {
    return choose([
      'For waterfalls, Kawasan Falls is the most famous and offers canyoneering adventures. Tumalog Falls and Cambais Falls are great if you want a calmer visit.',
      'Kawasan Falls is a top choice for canyoneering. Tumalog Falls is peaceful and beautiful, while Cambais is excellent if you want fewer crowds.',
    ]);
  }

  if (/(food|restaurant|eat|dinner|lunch|cafe|market|seafood|street food|lechon)/.test(lower)) {
    return choose([
      'Cebu is famous for lechon and fresh seafood. Try local favorites like Larsian for barbecue or La Vie Parisienne for a nicer meal.',
      'If you want local food, start with lechon and seafood. For a relaxed meal, try Cebu City cafes or seaside restaurants on Mactan Island.',
    ]);
  }

  if (/(transport|bus|taxi|grab|ride|jeepney|ferry|travel|commute|shuttle|airport)/.test(lower)) {
    return choose([
      'Getting around Cebu is easiest by Grab or taxi in the city, while jeepneys are cheap for short trips. For island trips, take the ferry from Cebu City or Lapu-Lapu.',
      'Grab is convenient in Cebu City, and jeepneys are good for budget travel. If you need island transfers, take the ferry or arrange a boat ride from Mactan.',
    ]);
  }

  if (/(itinerary|day trip|plan|what should i do|schedule|recommend|best of cebu|top spots|places to visit)/.test(lower)) {
    return choose([
      'A great Cebu itinerary is morning at a beach or dive spot, afternoon waterfall adventure, and evening trying local food in the city. How many days do you have?',
      'Try a day trip with a morning beach visit, afternoon waterfall, and evening food tour in Cebu City. Tell me your travel style and I can refine it.',
    ]);
  }

  if (/(budget|cheap|cost|price|price range|affordable)/.test(lower)) {
    return choose([
      'Cebu can be budget-friendly. Local meals are often 100-300 PHP, and transit is cheap if you use jeepneys or shared rides.',
      'Many attractions in Cebu are inexpensive. Food, transit, and beaches can be very affordable if you focus on local options.',
    ]);
  }

  if (/(hotel|stay|resort|accommodation|inn|hostel)/.test(lower)) {
    return choose([
      'For a convenient stay, Mactan has good resorts and is close to the airport. Cebu City has guesthouses and nice hotels near attractions.',
      'Mactan Island is great for resorts and airport access. Cebu City is better if you want food, nightlife, and city sightseeing.',
    ]);
  }

  if (/(weather|rain|sunny|hot|temperature|climate)/.test(lower)) {
    return choose([
      'Cebu is generally warm and tropical. If you visit during the rainy season, bring light rain gear and plan indoor backup activities.',
      'Expect warm weather in Cebu most of the year. It can rain suddenly, so carry a light umbrella or poncho when you travel around.',
    ]);
  }

  if (/(how are you|who are you|like you|best chatbot)/.test(lower)) {
    return choose([
      'I am your SeeBu travel assistant. I can answer Cebu travel questions and help you explore attractions, food, and transportation.',
      'I am a travel guide bot for Cebu. Ask me anything about where to go, what to eat, and how to get around.',
    ]);
  }

  if (/(thank you|thanks|ty|thank u)/.test(lower)) {
    return choose([
      'You’re welcome! Let me know if you need more Cebu travel tips.',
      'Glad I could help! Ask me anything else about Cebu anytime.',
    ]);
  }

  return choose([
    'I can help with Cebu beaches, waterfalls, food, transport, hotels and day trips. What would you like to know?',
    'Tell me if you want recommendations for beaches, waterfalls, food, or travel in Cebu, and I’ll give you a better answer.',
  ]);
};

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
  const [aiStatus, setAiStatus] = useState(USE_AI_PROXY ? 'active' : 'missing');
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

  const fetchProxyResponse = async (text) => {
    try {
      const reply = await fetchAiReply(text);
      setAiStatus('active');
      setAiError('');
      return { success: true, text: reply };
    } catch (error) {
      console.warn('AI error:', error?.message);
      setAiStatus('error');
      setAiError(error.message || 'Request failed');
      return { success: false, text: `Sorry, I couldn't reach the assistant. ${generateBotResponse(text)}` };
    }
  };

  const fetchAiResponse = async (text) => {
    if (USE_AI_PROXY) {
      const result = await fetchProxyResponse(text);
      return result.text;
    }

    return generateBotResponse(text);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const allowed = await consumeOne(auth.currentUser?.uid);
    setLeftToday(await remainingToday(auth.currentUser?.uid));
    if (!allowed) return;

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

    const botText = await fetchAiResponse(userText);
    // Conversation was cleared (or screen remounted) while waiting —
    // drop the stale reply, don't resurrect.
    if (genRef.current !== gen) return;
    const botResponse = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botResponse]);
    setLoading(false);
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
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.userBg,
                  opacity: inputText.trim() && !loading && leftToday > 0 ? 1 : 0.5,
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading || leftToday <= 0}
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

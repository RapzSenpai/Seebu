import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useColorScheme,
  KeyboardAvoidingView,
} from 'react-native';
import { Send, Mic, MessageCircle } from 'lucide-react-native';

// The app never talks to a model provider directly. It calls a small backend
// proxy (api/chat.js) that holds the API key server-side, so no secret is
// inlined into this bundle. Point EXPO_PUBLIC_AI_PROXY_URL at your deployment.
//
// While no proxy is configured the app falls back to generateBotResponse below,
// so the chat screen works with no network and no key at all.
const rawProxyUrl =
  process.env.EXPO_PUBLIC_AI_PROXY_URL ||
  '';
const AI_PROXY_URL = rawProxyUrl.trim().replace(/\/$/, '');
const USE_AI_PROXY = AI_PROXY_URL.length > 0;

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

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! 👋 I'm your SeeBu travel guide. How can I help you explore Cebu today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(USE_AI_PROXY ? 'active' : 'missing');
  const [aiError, setAiError] = useState('');
  const scrollViewRef = useRef(null);
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  const theme = {
    background: isDarkMode ? '#080808' : '#F5F5F7',
    card: isDarkMode ? '#111' : '#FFFFFF',
    text: isDarkMode ? '#FFF' : '#000',
    subtext: isDarkMode ? '#888' : '#666',
    botBg: isDarkMode ? '#1a1a1a' : '#E5E5EA',
    userBg: '#f7f200',
    border: isDarkMode ? '#1a1a1a' : '#E5E5EA',
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const fetchProxyResponse = async (text) => {
    try {
      const response = await fetch(`${AI_PROXY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.reply) {
        setAiStatus('active');
        setAiError('');
        return { success: true, text: data.reply.trim() };
      }

      console.warn('AI proxy error:', response.status, data);
      setAiStatus('error');
      setAiError(data?.error || `Request failed (${response.status})`);
      return { success: false, text: `Sorry, I couldn't get a reply right now. ${generateBotResponse(text)}` };
    } catch (error) {
      console.warn('AI proxy unreachable:', error);
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
    if (!inputText.trim()) return;

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

    const botText = await fetchAiResponse(userText);
    const botResponse = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botResponse]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <MessageCircle size={24} color="#f7f200" />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Assistant</Text>
      </View>

      <View style={styles.modeBanner}>
        <Text style={styles.modeText}>
          {aiStatus === 'active' && !aiError && 'Assistant connected. Responses may take a moment.'}
          {aiStatus === 'missing' && 'AI assistant not configured. Using local responses.'}
          {aiStatus === 'error' && `AI assistant error: ${aiError}. Using local responses.`}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userWrapper : styles.botWrapper
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? [styles.userBubble, { backgroundColor: theme.userBg }]
                  : [styles.botBubble, { backgroundColor: theme.botBg }]
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: message.sender === 'user' ? '#000' : theme.text
                  }
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.botWrapper}>
            <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: theme.botBg }]}>
              <ActivityIndicator size="small" color={theme.subtext} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Ask about Cebu attractions..."
          placeholderTextColor={theme.subtext}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Send size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 140 },
  messageWrapper: { marginBottom: 12 },
  userWrapper: { alignItems: 'flex-end' },
  botWrapper: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12 },
  userBubble: { borderBottomRightRadius: 0 },
  botBubble: { borderBottomLeftRadius: 0 },
  messageText: { fontSize: 14, lineHeight: 20 },
  modeBanner: {
    backgroundColor: '#323232',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  modeText: {
    color: '#f7f200',
    fontSize: 13,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 92,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 14 },
  sendButton: { backgroundColor: '#f7f200', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

export default ChatbotScreen;

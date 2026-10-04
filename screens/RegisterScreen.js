import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { auth, db, createUserWithEmailAndPassword, signOut } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, User, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import IslandBackground from '../components/IslandBackground';

const INTEREST_OPTIONS = ["Beaches", "Food", "History", "Nightlife", "Mountains", "Shopping"];

const RegisterScreen = () => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      // Always create the Firestore profile (all platforms); only native
      // signs out here so the user lands on RegistrationComplete > Login.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: normalizedEmail,
        interests: selectedInterests,
        createdAt: new Date().toISOString(),
        role: 'user',
      });

      if (Platform.OS !== 'web') {
        await signOut(auth);
      }

      router.replace('/registration-complete');
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error.message || 'Registration failed.');
      } else {
        Alert.alert("Registration Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <IslandBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.logoText, { color: full.accentForeground }]}>S</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Join SeeBu</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>Create an account to explore Cebu.</Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
            focusedInput === 'name' && { borderColor: colors.accent, backgroundColor: full.muted }
          ]}>
            <User color={focusedInput === 'name' ? colors.accent : colors.subText} size={20} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text }]}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Email Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
            focusedInput === 'email' && { borderColor: colors.accent, backgroundColor: full.muted }
          ]}>
            <Mail color={focusedInput === 'email' ? colors.accent : colors.subText} size={20} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Password Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
            focusedInput === 'password' && { borderColor: colors.accent, backgroundColor: full.muted }
          ]}>
            <Lock color={focusedInput === 'password' ? colors.accent : colors.subText} size={20} />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text }]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Interests Section */}
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>What interests you?</Text>
          <View style={styles.interestContainer}>
            {INTEREST_OPTIONS.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestChip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  selectedInterests.includes(interest) && { backgroundColor: colors.accent, borderColor: colors.accent }
                ]}
              >
                <Text style={[
                  styles.interestText,
                  { color: colors.subText },
                  selectedInterests.includes(interest) && { color: full.accentForeground }
                ]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={full.accentForeground} />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={[styles.buttonText, { color: full.accentForeground }]}>Register</Text>
                <CheckCircle2 color={full.accentForeground} size={20} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/login')}
          style={styles.footerLink}
        >
          <Text style={[styles.footerText, { color: colors.subText }]}>
            Already a member? <Text style={[styles.link, { color: colors.accent }]}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70 },
  scrollContent: { flexGrow: 1, padding: 25, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 35 },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    transform: [{ rotate: '-10deg' }]
  },
  logoText: { fontSize: 28, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 15, marginTop: 5 },

  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    height: 60
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },

  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 15, marginBottom: 15 },
  interestContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: { fontWeight: '600', fontSize: 13 },

  button: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { fontWeight: '800', fontSize: 18, marginRight: 8 },

  footerLink: { marginTop: 30 },
  footerText: { textAlign: 'center', fontSize: 15 },
  link: { fontWeight: '800' }
});

export default RegisterScreen;

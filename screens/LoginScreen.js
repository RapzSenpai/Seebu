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
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import IslandBackground from '../components/IslandBackground';

const LoginScreen = () => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      // Auth state change in App.js switches to the authenticated stack automatically.
    } catch (error) {
      let errorMessage = "An error occurred during login.";
      if (error.code === 'auth/user-not-found') errorMessage = "No account found with this email.";
      if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      if (error.code === 'auth/invalid-email') errorMessage = "Please enter a valid email address.";

      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Reset Password", "Please enter your email address first.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    Alert.alert(
      "Reset Password",
      `Send a password reset link to ${normalizedEmail}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, normalizedEmail);
              Alert.alert("Success", "Reset link sent! Check your inbox.");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
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
          <Text style={[styles.title, { color: colors.text }]}>SeeBu</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>Discover the Heart of Cebu.</Text>
        </View>

        <View style={styles.form}>
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
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              {secureText ? <EyeOff color={colors.subText} size={20} /> : <Eye color={colors.accent} size={20} />}
            </TouchableOpacity>
          </View>

          {!!loginError && (
            <Text style={[styles.errorText, { color: full.destructive }]}>{loginError}</Text>
          )}

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.accent }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.accent, shadowColor: colors.accent },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={full.accentForeground} />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={[styles.buttonText, { color: full.accentForeground }]}>Sign In</Text>
                <ArrowRight color={full.accentForeground} size={20} />
              </View>
            )}
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => router.replace('/register')}
          style={styles.footerLink}
        >
          <Text style={[styles.footerText, { color: colors.subText }]}>
            Don&apos;t have an account? <Text style={[styles.link, { color: colors.accent }]}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    transform: [{ rotate: '-10deg' }]
  },
  logoText: { fontSize: 32, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
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

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontSize: 14, fontWeight: '600' },

  button: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { fontWeight: '800', fontSize: 18, marginRight: 8 },
  footerLink: { marginTop: 40 },
  footerText: { textAlign: 'center', fontSize: 15 },
  link: { fontWeight: '800' },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 6,
  },
});

export default LoginScreen;

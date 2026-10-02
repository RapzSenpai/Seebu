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

const INTEREST_OPTIONS = ["Beaches", "Food", "History", "Nightlife", "Mountains", "Shopping"];

const RegisterScreen = () => {
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

      if (Platform.OS !== 'web') {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: name,
          email: normalizedEmail,
          interests: selectedInterests,
          createdAt: new Date().toISOString(),
          role: 'user',
        });

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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Join SeeBu</Text>
          <Text style={styles.subtitle}>Create an account to explore Cebu.</Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputFocused]}>
            <User color={focusedInput === 'name' ? "#f7f200" : "#666"} size={20} />
            <TextInput 
              placeholder="Full Name" 
              placeholderTextColor="#555"
              style={styles.input}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Email Input */}
          <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputFocused]}>
            <Mail color={focusedInput === 'email' ? "#f7f200" : "#666"} size={20} />
            <TextInput 
              placeholder="Email Address" 
              placeholderTextColor="#555"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
            <Lock color={focusedInput === 'password' ? "#f7f200" : "#666"} size={20} />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#555"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Interests Section */}
          <Text style={styles.sectionTitle}>What interests you?</Text>
          <View style={styles.interestContainer}>
            {INTEREST_OPTIONS.map((interest) => (
              <TouchableOpacity 
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.interestChipSelected
                ]}
              >
                <Text style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.interestTextSelected
                ]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Register</Text>
                <CheckCircle2 color="#000" size={20} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/login')}
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            Already a member? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', paddingTop: 70 },
  scrollContent: { flexGrow: 1, padding: 25, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 35 },
  logoBadge: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#f7f200', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    transform: [{ rotate: '-10deg' }]
  },
  logoText: { fontSize: 28, fontWeight: '900', color: '#000' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 5 },
  
  form: { width: '100%' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    borderRadius: 16, 
    marginBottom: 16, 
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    height: 60
  },
  inputFocused: { borderColor: '#f7f200', backgroundColor: '#161616' },
  input: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 16 },

  sectionTitle: { color: '#f7f200', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 15, marginBottom: 15 },
  interestContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  interestChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#222',
    backgroundColor: '#111'
  },
  interestChipSelected: { backgroundColor: '#f7f200', borderColor: '#f7f200' },
  interestText: { color: '#888', fontWeight: '600', fontSize: 13 },
  interestTextSelected: { color: '#000' },
  
  button: { 
    backgroundColor: '#f7f200', 
    height: 60, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 18, marginRight: 8 },
  
  footerLink: { marginTop: 30 },
  footerText: { color: '#666', textAlign: 'center', fontSize: 15 },
  link: { color: '#f7f200', fontWeight: '800' }
});

export default RegisterScreen;
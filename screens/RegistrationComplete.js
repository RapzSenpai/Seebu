import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const RegistrationComplete = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}> 
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}> 
          <Feather name="check-circle" size={64} color="#f7f200" />
        </Animated.View>
        <Text style={styles.title}>Registered Successfully</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully. Please log in.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/login')}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>OK</Text>
            <Feather name="arrow-right" size={18} color="#000" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#f7f200',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#f7f200',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#f7f200',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RegistrationComplete;

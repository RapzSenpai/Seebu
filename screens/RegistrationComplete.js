import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';

const RegistrationComplete = () => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
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
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <Animated.View style={[styles.card, { backgroundColor: colors.card, shadowColor: '#000', transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.iconWrapper, { backgroundColor: full.muted, shadowColor: colors.accent, transform: [{ scale: scaleAnim }] }]}>
          <Feather name="check-circle" size={64} color={colors.accent} />
        </Animated.View>
        <Text style={[styles.title, { color: colors.text }]}>Registered Successfully</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Your account has been created successfully. Please log in.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => router.replace('/login')}
        >
          <View style={styles.buttonInner}>
            <Text style={[styles.buttonText, { color: full.accentForeground }]}>OK</Text>
            <Feather name="arrow-right" size={18} color={full.accentForeground} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
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
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RegistrationComplete;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { authenticate } from '../utils/biometric';

// ponytail: dumb overlay. One prompt per Unlock tap; cancel just shows a
// retry hint, never loops. Sign-out is the only way out besides passing.
const BiometricLock = ({ onUnlocked, onSignOut }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const unlock = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await authenticate('Unlock SeeBu');
      if (res.success) {
        onUnlocked();
      } else {
        setFailed(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Feather name="lock" size={30} color={full.accentForeground} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>SeeBu is locked</Text>
      <Text style={[styles.sub, { color: colors.subText }]}>
        {failed ? 'Not recognized — try again.' : 'Unlock with biometrics to continue.'}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent }, busy && { opacity: 0.7 }]}
        onPress={unlock}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={full.accentForeground} />
        ) : (
          <Text style={[styles.buttonText, { color: full.accentForeground }]}>Unlock</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onSignOut} style={styles.signout}>
        <Text style={[styles.signoutText, { color: colors.subText }]}>Sign out instead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '900' },
  sub: { fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 21 },
  button: {
    marginTop: 24,
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontWeight: '800', fontSize: 17 },
  signout: { marginTop: 16, padding: 10 },
  signoutText: { fontWeight: '700', fontSize: 15 },
});

export default BiometricLock;

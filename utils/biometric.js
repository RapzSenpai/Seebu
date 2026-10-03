import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ponytail: lazy require keeps the web bundle free of the native module.
// Flag is per-uid in AsyncStorage (not secret; the Firebase session is the
// credential, the flag only says "ask biometrics first").
const flagKey = (uid) => `seebu:biometric:${uid}`;

function nativeModule() {
  if (Platform.OS === 'web') return null;
  return require('expo-local-authentication');
}

export async function biometricStatus() {
  const mod = nativeModule();
  if (!mod) return { ok: false, reason: 'Not available on web' };
  try {
    if (!(await mod.hasHardwareAsync())) {
      return { ok: false, reason: 'No biometric hardware' };
    }
    if (!(await mod.isEnrolledAsync())) {
      return { ok: false, reason: 'No biometrics enrolled' };
    }
    return { ok: true, reason: '' };
  } catch {
    return { ok: false, reason: 'Unavailable' };
  }
}

export async function biometricEnabled(uid) {
  if (!uid) return false;
  try {
    return (await AsyncStorage.getItem(flagKey(uid))) === '1';
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(uid, on) {
  if (!uid) return;
  try {
    await AsyncStorage.setItem(flagKey(uid), on ? '1' : '0');
  } catch {}
}

// One prompt per call — callers invoke once per unlock tap, never in a loop.
export async function authenticate(reason = 'Unlock SeeBu') {
  const mod = nativeModule();
  if (!mod) return { success: false };
  try {
    return await mod.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Use password instead',
      disableDeviceFallback: false,
    });
  } catch {
    return { success: false };
  }
}

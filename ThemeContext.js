import { useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import { useColorScheme } from './lib/useColorScheme';
import { useAuth } from './providers/AuthProvider';

// Deprecated shim no more: useTheme is still the single call site, but it now
// owns per-user persistence. Device-global Nativewind storage leaks theme
// across accounts, so the Firestore user doc is source of truth with a
// per-uid AsyncStorage cache for instant loads. Logged-out = light.
const themeKey = (uid) => (uid ? `seebu:theme:${uid}` : 'seebu:theme:guest');

const sanitize = (v) => (v === 'dark' ? 'dark' : v === 'light' ? 'light' : null);

async function loadStoredTheme(uid) {
  try {
    const local = sanitize(await AsyncStorage.getItem(themeKey(uid)));
    if (local) return local;
  } catch {}
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const remote = sanitize(snap.exists() ? snap.data()?.theme : null);
    if (remote) {
      try {
        await AsyncStorage.setItem(themeKey(uid), remote);
      } catch {}
      return remote;
    }
  } catch {}
  return null;
}

async function persistTheme(uid, scheme) {
  const value = sanitize(scheme) ?? 'light';
  try {
    await AsyncStorage.setItem(themeKey(uid), value);
  } catch {}
  if (!uid) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      { theme: value, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch {}
}

// ponytail: per-uid cache + Firestore doc, no new dep. Guest always light.
const ThemeProvider = ({ children }) => children;

const useTheme = () => {
  const { colorScheme, isDarkColorScheme, setColorScheme, colors } = useColorScheme();
  const { user } = useAuth();

  const setIsDarkMode = useCallback(
    (value) => {
      const scheme = value ? 'dark' : 'light';
      setColorScheme(scheme);
      persistTheme(user?.uid, scheme);
    },
    [setColorScheme, user?.uid]
  );

  return useMemo(
    () => ({
      isDarkMode: isDarkColorScheme,
      setIsDarkMode,
      colors: {
        background: colors.background,
        card: colors.card,
        text: colors.foreground,
        subText: colors.mutedForeground,
        accent: colors.primary,
        border: colors.border,
      },
      colorScheme,
    }),
    [colors, colorScheme, isDarkColorScheme, setIsDarkMode]
  );
};

export { ThemeProvider, useTheme, loadStoredTheme, persistTheme };

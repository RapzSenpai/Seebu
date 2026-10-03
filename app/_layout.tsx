import '../global.css';

import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// expo-router 6.0.24 does not re-export ThemeProvider, so it comes from
// @react-navigation/native (it is defined in @react-navigation/core).
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';

import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from '@/lib/useColorScheme';
import { setAccentUid } from '@/lib/accent';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { UserProvider } from '../UserContext';
import { loadStoredTheme } from '../ThemeContext';
import { biometricEnabled } from '../utils/biometric';
import BiometricLock from '../components/BiometricLock';
import { auth, signOut } from '../firebase';

export { ErrorBoundary } from 'expo-router';

function RootNavigator() {
  const { user, loading } = useAuth();
  const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();

  // Per-user appearance: guest always light + default accent. Login loads
  // the uid prefs (local cache then Firestore), fallback light + default.
  // themeReady gates first paint so a dark-mode user never sees a flash
  // of light. Kills cross-account leaks from any shared store.
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAccentUid(user?.uid ?? null);
      if (!user) {
        setColorScheme('light');
        if (!cancelled) setThemeReady(true);
        return;
      }
      const stored = await loadStoredTheme(user.uid);
      if (!cancelled) {
        setColorScheme(stored === 'dark' ? 'dark' : 'light');
        setThemeReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Biometric app lock: engaged on login and every foreground return while
  // the per-user flag is on. Sign-out is the only bypass, by design.
  const [bioLocked, setBioLocked] = useState(false);
  const [bioChecked, setBioChecked] = useState(false);
  const unlockedAt = useRef(0);
  useEffect(() => {
    setBioChecked(false);
    (async () => {
      if (user && (await biometricEnabled(user.uid))) {
        setBioLocked(true);
      } else {
        setBioLocked(false);
      }
      setBioChecked(true);
    })();
  }, [user?.uid]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      // ponytail: grace window so the return-from-system-prompt 'active'
      // event after a successful unlock never relocks instantly.
      if (state === 'active' && user && Date.now() - unlockedAt.current > 3000) {
        if (await biometricEnabled(user.uid)) setBioLocked(true);
      }
    });
    return () => sub.remove();
  }, [user?.uid]);

  if (loading || (!!user && (!bioChecked || !themeReady))) return null;

  return (
    <>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            // ponytail: themed card behind every transition. Without this
            // the native stack paints white mid-fade = flashbang in dark.
            contentStyle: { backgroundColor: NAV_THEME[colorScheme].colors.background },
          }}
        >
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="spot" />
            <Stack.Screen name="about" />
            <Stack.Screen name="contact" />
            <Stack.Screen name="appearance" />
            <Stack.Screen name="accent" />
            <Stack.Screen name="admin" />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="registration-complete" />
          </Stack.Protected>
        </Stack>
      </NavThemeProvider>
      {bioLocked && !!user && (
        <BiometricLock
          onUnlocked={() => {
            unlockedAt.current = Date.now();
            setBioLocked(false);
          }}
          onSignOut={() => signOut(auth).catch(() => {})}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  // ponytail: the root view sits behind every screen transition. Unthemed
  // it shows the OS window (white) mid-fade = flashbang in dark mode.
  const { colorScheme } = useColorScheme();
  return (
    <AuthProvider>
      <UserProvider>
        <GestureHandlerRootView
          style={{
            flex: 1,
            backgroundColor:
              NAV_THEME[colorScheme ?? 'light'].colors.background,
          }}
        >
          <RootNavigator />
          <PortalHost />
        </GestureHandlerRootView>
      </UserProvider>
    </AuthProvider>
  );
}
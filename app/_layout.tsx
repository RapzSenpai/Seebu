import '../global.css';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// expo-router 6.0.24 does not re-export ThemeProvider, so it comes from
// @react-navigation/native (it is defined in @react-navigation/core).
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';

import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from '@/lib/useColorScheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { UserProvider } from '../UserContext';

export { ErrorBoundary } from 'expo-router';

function RootNavigator() {
  const { user, loading } = useAuth();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  if (loading) return null;

  return (
    <>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="spot" />
            <Stack.Screen name="admin" />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="registration-complete" />
          </Stack.Protected>
        </Stack>
      </NavThemeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
          <PortalHost />
        </GestureHandlerRootView>
      </UserProvider>
    </AuthProvider>
  );
}
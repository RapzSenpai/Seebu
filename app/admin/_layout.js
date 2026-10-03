import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { Stack, Redirect, Slot } from 'expo-router';
import { useTheme } from '../../ThemeContext';
import { useUser } from '../../UserContext';
import AdminSidebar from '../../components/AdminSidebar';

const ADMIN_SCREENS = ['index', 'users', 'spots', 'add-spot', 'guides', 'messages'];

export default function AdminLayout() {
  const { colors } = useTheme();
  const { isAdmin, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  // Web gets a fixed left sidebar; the APK gets the same items as a
  // slide-over drawer (no web layout renders inside a native build).
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        <AdminSidebar />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            {ADMIN_SCREENS.map((name) => (
              <Stack.Screen key={name} name={name} />
            ))}
          </Stack>
        </View>
      </View>
    );
  }

  // Native screens render their own menu via components/AdminScreen —
  // nothing floats over content.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
    </View>
  );
}

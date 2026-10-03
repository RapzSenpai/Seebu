import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { useUser } from '../../UserContext';

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const { isAdmin, loading: roleLoading } = useUser();
  const insets = useSafeAreaInsets();

  // ponytail: system nav bar follows app theme so edge-to-edge never clashes.
  // Side spacing of the app tab bar lives in tabBarStyle below, not here.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setBackgroundColorAsync(isDarkMode ? '#08080A' : '#F2F5F7').catch(() => {});
    NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark').catch(() => {});
  }, [isDarkMode]);

  if (roleLoading) return null;
  if (isAdmin) return <Redirect href="/admin" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'maps') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          const iconScale = focused ? 1.08 : 1;
          return (
            <Ionicons
              name={iconName}
              size={26}
              color={color}
              style={{ transform: [{ scale: iconScale }] }}
            />
          );
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: full.mutedForeground,
        headerShown: false,
        animationEnabled: true,
        lazy: true,
        sceneContainerStyle: { backgroundColor: colors.background },
        tabBarPressColor: colors.accent,

        tabBarHideOnKeyboard: true,
        /* FLOATING TAB BAR STYLING */
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(16, insets.bottom + 10),
          left: 20,
          right: 20,
          start: 20,
          end: 20,
          elevation: 3,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 25,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          // ponytail: shadow is always black + faint. colors.text is white
          // in dark mode = glowing bar. Border carries the separation.
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          ...Platform.select({
            web: { maxWidth: 520, marginHorizontal: 'auto' },
            default: {},
          }),
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="maps" options={{ title: 'Maps' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

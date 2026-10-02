import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
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
          const iconScale = focused ? 1.15 : 1;
          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
              style={{ transform: [{ scale: iconScale }] }}
            />
          );
        },
        tabBarActiveTintColor: '#f7f200',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        animationEnabled: true,
        lazy: true,
        sceneContainerStyle: { backgroundColor: '#080808' },
        tabBarPressColor: '#f7f20033',

        /* FLOATING TAB BAR STYLING */
        tabBarStyle: {
          position: 'absolute',
          bottom: 20, // Distance from bottom of screen
          left: 20, // Horizontal margin
          right: 20, // Horizontal margin
          elevation: 5, // Shadow for Android
          backgroundColor: '#121212', // Slightly lighter than black to see the float
          borderRadius: 25, // Rounded pill shape
          height: 65, // Height of the bar
          borderTopWidth: 0, // Remove default top border
          paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for OS
          paddingTop: 10,
          // Shadow for iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
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
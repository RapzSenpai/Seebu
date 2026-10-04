import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import MapComponent from './MapComponent';
import { useSpots } from '../utils/useSpots';
import { useTheme } from '../ThemeContext';
import IslandBackground from '../components/IslandBackground';

const MapScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { spots, refresh: refreshSpots } = useSpots();
  // DATA-03: same one-shot staleness as Explore — refresh every visit.
  useFocusEffect(
    React.useCallback(() => {
      refreshSpots();
    }, [refreshSpots])
  );
  const handleSpotPress = (spot) => {
    router.push({
      pathname: '/spot',
      params: { spot: JSON.stringify(spot) },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <IslandBackground />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <MapComponent spots={spots} onSpotPress={handleSpotPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MapScreen;

import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import MapComponent from './MapComponent';
import { cebuSpots } from '../utils/spots';

const MapScreen = () => {
  const handleSpotPress = (spot) => {
    router.push({
      pathname: '/spot',
      params: { spot: JSON.stringify(spot) },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <MapComponent spots={cebuSpots} onSpotPress={handleSpotPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MapScreen;

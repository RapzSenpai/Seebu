import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MapComponent = ({ spots, onSpotPress }) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} 
        style={styles.map}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {spots.map((spot) => {
          if (!spot.coords || !spot.coords.latitude) return null;

          return (
            <Marker
              key={spot.id}
              coordinate={spot.coords}
              title={spot.title}
              description={spot.loc}
              pinColor="#f7f200"
              onPress={() => onSpotPress?.(spot)}
            />
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
});

export default MapComponent;
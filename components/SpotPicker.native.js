import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../ThemeContext';

const CEBU_REGION = {
  latitude: 10.3157,
  longitude: 123.8854,
  latitudeDelta: 0.9,
  longitudeDelta: 0.9,
};

// Native pin picker. Web has its own file so leaflet never ships to native.
// focusKey bumps on suggestion pick → map animates to street level there.
const SpotPicker = ({ coords, onPick, focusKey }) => {
  const { colors } = useTheme();
  const mapRef = useRef(null);

  const pick = (c) => onPick({ latitude: c.latitude, longitude: c.longitude });

  useEffect(() => {
    if (!mapRef.current || !coords || !focusKey) return;
    mapRef.current.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      600
    );
  }, [focusKey]);

  return (
    <View>
      <View style={[styles.mapWrap, { borderColor: colors.border }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={CEBU_REGION}
          onPress={(e) => pick(e.nativeEvent.coordinate)}
        >
          {coords ? (
            <Marker
              coordinate={coords}
              draggable
              onDragEnd={(e) => pick(e.nativeEvent.coordinate)}
            />
          ) : null}
        </MapView>
      </View>
      <Text style={[styles.hint, { color: colors.subText }]}>
        {coords
          ? `Pin: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} — tap map or drag pin to move.`
          : 'Tap the map to drop a pin.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: { height: 240, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  map: { width: '100%', height: '100%' },
  hint: { fontSize: 12, marginTop: 6, marginBottom: 14 },
});

export default SpotPicker;

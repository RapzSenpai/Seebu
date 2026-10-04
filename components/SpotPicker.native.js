import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { useTheme } from '../ThemeContext';
import { mapStyleFor, lngLatOf } from '../utils/mapTiles';

// Native pin picker. Web has its own file so leaflet never ships to native.
// focusKey bumps on suggestion pick → camera flies to street level there.
// Tap the map to drop or move the pin (MapLibre markers aren't draggable,
// so the old drag gesture is tap-to-move now).
const SpotPicker = ({ coords, onPick, focusKey }) => {
  const { colors, isDarkMode } = useTheme();
  const cameraRef = useRef(null);

  const pick = (lngLat) =>
    onPick({ latitude: lngLat[1], longitude: lngLat[0] });

  useEffect(() => {
    if (!coords || !focusKey) return;
    cameraRef.current?.easeTo({ center: lngLatOf(coords), zoom: 15, duration: 600 });
  }, [focusKey]);

  return (
    <View>
      <View style={[styles.mapWrap, { borderColor: colors.border }]}>
        <Map
          style={styles.map}
          mapStyle={mapStyleFor(isDarkMode)}
          onPress={(e) => pick(e.nativeEvent.lngLat)}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{ center: [123.8854, 10.3157], zoom: 9 }}
          />
          {coords ? (
            <Marker id="pin" lngLat={lngLatOf(coords)} anchor="bottom">
              <View style={[styles.pin, { backgroundColor: colors.accent, borderColor: '#fff' }]} />
            </Marker>
          ) : null}
        </Map>
      </View>
      <Text style={[styles.hint, { color: colors.subText }]}>
        {coords
          ? `Pin: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} — tap map to move.`
          : 'Tap the map to drop a pin.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: { height: 240, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  map: { width: '100%', height: '100%' },
  pin: { width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  hint: { fontSize: 12, marginTop: 6, marginBottom: 14 },
});

export default SpotPicker;

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';

const CEBU = { lat: 10.3157, lng: 123.8854 };

const tileUrl = (dark) =>
  dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// Web-only pin picker. Separate file so native never imports leaflet.
// focusKey bumps when a search suggestion is picked, so the map flies to
// the result; plain pin drags only re-pan without forcing zoom.
const SpotPicker = ({ coords, onPick, focusKey }) => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const markerRef = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const styleRef = useRef({ pin: colors.accent, bg: full.muted });
  styleRef.current = { pin: colors.accent, bg: full.muted };

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { center: [CEBU.lat, CEBU.lng], zoom: 11 });
    mapRef.current = map;
    map.on('click', (e) =>
      pickRef.current({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    );
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) tileRef.current.remove();
    tileRef.current = L.tileLayer(tileUrl(isDarkMode), {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
  }, [isDarkMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (!coords) return;
    const s = styleRef.current;
    const icon = L.divIcon({
      className: '',
      html:
        `<div style="color:${s.pin};background:${s.bg};` +
        'display:flex;align-items:center;justify-content:center;border-radius:50%;' +
        'width:36px;height:36px;font-size:16px;transform:translate(-50%,-50%);' +
        '">📍</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    markerRef.current = L.marker([coords.latitude, coords.longitude], {
      icon,
      draggable: true,
    }).addTo(map);
    markerRef.current.on('dragend', (e) => {
      const p = e.target.getLatLng();
      pickRef.current({ latitude: p.lat, longitude: p.lng });
    });
    map.panTo([coords.latitude, coords.longitude]);
  }, [coords]);

  // Suggestion picked: center + zoom to street level so the pin is exact.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords || !focusKey) return;
    map.setView([coords.latitude, coords.longitude], Math.max(map.getZoom(), 14));
  }, [focusKey]);

  return (
    <View>
      <View style={[styles.mapWrap, { borderColor: colors.border }]}>
        <div ref={divRef} style={{ width: '100%', height: '100%' }} />
      </View>
      <Text style={[styles.hint, { color: colors.subText }]}>
        {coords
          ? `Pin: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} — click map or drag pin to move.`
          : 'Click the map to drop a pin.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: { height: 240, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  hint: { fontSize: 12, marginTop: 6, marginBottom: 14 },
});

export default SpotPicker;

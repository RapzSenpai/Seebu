import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Crosshair } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { fetchRoute, haversineKm, formatEta } from '../utils/routing';

const CEBU_CENTER = {
  latitude: 10.3157,
  longitude: 123.8854,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// ponytail: memo markers (12 spots, no cluster lib needed at this count).
// tracksViewChanges intentionally left default: freezing it skips the custom
// view's first paint on Android and pins never appear.
const MemoMarker = React.memo(({ spot, selected, pinBg, fg, onPress }) => (
  <Marker coordinate={spot.coords} onPress={onPress}>
    <View
      style={{
        width: selected ? 44 : 34,
        height: selected ? 44 : 34,
        borderRadius: selected ? 22 : 17,
        backgroundColor: pinBg,
        borderWidth: selected ? 3 : 2,
        borderColor: fg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: fg, fontWeight: '900', fontSize: selected ? 16 : 14 }}>
        {spot.title.charAt(0).toUpperCase()}
      </Text>
    </View>
  </Marker>
));

const openExternalMaps = (spot) => {
  const latLng = `${spot.coords.latitude},${spot.coords.longitude}`;
  const url = Platform.select({
    ios: `maps:0,0?q=${spot.title}&daddr=${latLng}`,
    android: `google.navigation:q=${latLng}`,
  });
  Linking.openURL(url);
};

const MapComponent = ({ spots = [], onSpotPress }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const mapRef = useRef(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [userLoc, setUserLoc] = useState(null);
  const [locDenied, setLocDenied] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const fittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocDenied(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLoc(pos.coords);
      } catch {
        setLocDenied(true);
      }
    })();
  }, []);

  const types = useMemo(
    () => ['All', ...new Set(spots.map((s) => s.type).filter(Boolean))],
    [spots]
  );

  const validSpots = useMemo(
    () => spots.filter((s) => s.coords?.latitude),
    [spots]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return validSpots.filter(
      (s) =>
        (typeFilter === 'All' || s.type === typeFilter) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.loc.toLowerCase().includes(q))
    );
  }, [validSpots, query, typeFilter]);

  const selected = filtered.find((s) => s.id === selectedId) ?? null;

  // Frame every pin on load (mirrors web fitBounds): the fixed Cebu City
  // region hides 8 of 12 spots. Runs once so later pans are never yanked.
  useEffect(() => {
    if (!mapReady || fittedRef.current || validSpots.length === 0) return;
    fittedRef.current = true;
    mapRef.current?.fitToCoordinates(
      validSpots.map((s) => s.coords),
      { edgePadding: { top: 120, right: 40, bottom: 60, left: 40 }, animated: false }
    );
  }, [mapReady, validSpots]);

  const pickSpot = useCallback((spot) => {
    setSelectedId(spot.id);
  }, []);

  // Route line + distance + ETA for the selected spot (OSRM, free, no key).
  useEffect(() => {
    let stale = false;
    setRoute(null);
    setRouteError('');
    if (!selected || !userLoc) return;
    setRouteLoading(true);
    fetchRoute(userLoc, selected.coords)
      .then((r) => {
        if (!stale) setRoute(r);
      })
      .catch((e) => {
        if (!stale) setRouteError(e.message);
      })
      .finally(() => {
        if (!stale) setRouteLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [selected?.id, userLoc?.latitude, userLoc?.longitude]);

  const recenter = useCallback(() => {
    if (!userLoc) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      },
      400
    );
  }, [userLoc]);

  const straightKm =
    selected && userLoc ? haversineKm(userLoc, selected.coords) : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={CEBU_CENTER}
        showsUserLocation={!!userLoc}
        onMapReady={() => setMapReady(true)}
      >
        {filtered.map((spot) => (
          <MemoMarker
            key={spot.id}
            spot={spot}
            selected={spot.id === selectedId}
            pinBg={spot.id === selectedId ? full.primary : colors.accent}
            fg={
              spot.id === selectedId
                ? full.primaryForeground
                : full.accentForeground
            }
            onPress={() => pickSpot(spot)}
          />
        ))}
        {route && (
          <Polyline
            coordinates={route.coords}
            strokeColor={full.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View pointerEvents="box-none" style={styles.topOverlay}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search spots on map..."
            placeholderTextColor={colors.subText}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {types.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    typeFilter === t ? colors.accent : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      typeFilter === t
                        ? full.accentForeground
                        : colors.subText,
                  },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {locDenied && (
          <Text style={[styles.notice, { color: colors.subText }]}>
            Location off — distances and routing hidden.
          </Text>
        )}
      </View>

      {userLoc && (
        <TouchableOpacity
          onPress={recenter}
          style={[
            styles.recenter,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Crosshair size={20} color={colors.accent} />
        </TouchableOpacity>
      )}

      {selected && (
        <View
          style={[
            styles.preview,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Image source={{ uri: selected.img }} style={styles.previewImg} />
          <View style={styles.previewInfo}>
            <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>
              {selected.title}
            </Text>
            <Text style={[styles.previewSub, { color: colors.subText }]}>
              {selected.type} • {selected.loc}
            </Text>
            {selected.rating != null && (
              <Text style={[styles.previewSub, { color: colors.accent }]}>
                {`\u2605 ${selected.rating.toFixed(1)}`}
              </Text>
            )}
            {routeLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={styles.previewMeta}
              />
            ) : route ? (
              <Text
                style={[styles.previewMeta, { color: colors.accent }]}
              >{`${route.distanceKm.toFixed(1)} km • ${formatEta(route.etaMin)}`}</Text>
            ) : straightKm != null ? (
              <Text style={[styles.previewMeta, { color: colors.accent }]}>
                {routeError
                  ? `${straightKm.toFixed(1)} km straight-line`
                  : `${straightKm.toFixed(1)} km away`}
              </Text>
            ) : null}
            {routeError ? (
              <Text style={[styles.previewErr, { color: full.destructive }]}>
                {routeError}
              </Text>
            ) : null}
            <View style={styles.previewBtns}>
              <TouchableOpacity
                onPress={() => openExternalMaps(selected)}
                style={[styles.btn, { backgroundColor: colors.accent }]}
              >
                <Text
                  style={[styles.btnText, { color: full.accentForeground }]}
                >
                  Directions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSpotPress?.(selected)}
                style={[styles.btn, { backgroundColor: full.muted }]}
              >
                <Text style={[styles.btnText, { color: colors.text }]}>
                  Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setSelectedId(null)}
            style={styles.previewClose}
          >
            <Text style={[styles.previewCloseText, { color: colors.subText }]}>
              {'\u2715'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
  },
  searchBar: {
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchInput: { fontSize: 15 },
  chips: { paddingTop: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  notice: { fontSize: 12, marginTop: 6, marginLeft: 4 },
  recenter: {
    // ponytail: top-right under search/chips, never collides with the
    // preview sheet no matter how tall its content grows. No math to maintain.
    position: 'absolute',
    top: 190,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  preview: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 100,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
  },
  previewImg: { width: 86, height: 86, borderRadius: 12 },
  previewInfo: { flex: 1, marginLeft: 12 },
  previewTitle: { fontSize: 16, fontWeight: '800' },
  previewSub: { fontSize: 12, marginTop: 2 },
  previewMeta: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  previewErr: { fontSize: 11, marginTop: 4 },
  previewBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { fontWeight: '800', fontSize: 14 },
  previewClose: { padding: 4 },
  previewCloseText: { fontSize: 16, fontWeight: '800' },
});

export default MapComponent;

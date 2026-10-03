import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as Location from 'expo-location';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { fetchRoute, haversineKm, formatEta } from '../utils/routing';
import { useReviewStats } from '../utils/useReviewStats';

const CEBU_CENTER = { lat: 10.3157, lng: 123.8854 };

// CARTO basemaps: free with attribution, no key. Dark variant for dark mode.
const tileUrl = (dark) =>
  dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

const createMarkerIcon = (pinColor, selected, chipBg) =>
  L.divIcon({
    className: '',
    html:
      `<div style="color:${pinColor};background:${chipBg};` +
      `display:flex;align-items:center;justify-content:center;border-radius:50%;` +
      `width:${selected ? 46 : 36}px;height:${selected ? 46 : 36}px;` +
      `font-size:${selected ? 20 : 16}px;transform:translate(-50%,-50%);` +
      (selected ? `border:3px solid ${pinColor};` : '') +
      `">📍</div>`,
    iconSize: [selected ? 46 : 36, selected ? 46 : 36],
    iconAnchor: [selected ? 23 : 18, selected ? 23 : 18],
  });

const MapComponent = ({ spots = [], onSpotPress }) => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [userLoc, setUserLoc] = useState(null);
  const [locDenied, setLocDenied] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const { stats: reviewStats } = useReviewStats();

  const types = useMemo(
    () => ['All', ...new Set(spots.map((s) => s.type).filter(Boolean))],
    [spots]
  );

  const validSpots = useMemo(
    () => spots.filter((spot) => spot.coords?.latitude),
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

  // ponytail: nearest-first when located, default order otherwise. No toggle.
  const sorted = useMemo(() => {
    if (!userLoc) return filtered;
    return [...filtered].sort(
      (a, b) => haversineKm(userLoc, a.coords) - haversineKm(userLoc, b.coords)
    );
  }, [filtered, userLoc]);

  const straightKm =
    selected && userLoc ? haversineKm(userLoc, selected.coords) : null;

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [CEBU_CENTER.lat, CEBU_CENTER.lng],
      zoom: 11,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Theme-matching basemap: swap light/dark tiles (free CARTO, no key).
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    tileLayerRef.current = L.tileLayer(tileUrl(isDarkMode), {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
  }, [isDarkMode, mapInstanceRef.current]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filtered.forEach((spot) => {
      const isSel = spot.id === selectedId;
      const marker = L.marker(
        [spot.coords.latitude, spot.coords.longitude],
        {
          icon: createMarkerIcon(
            isSel ? full.primary : colors.accent,
            isSel,
            full.muted
          ),
        }
      )
        .addTo(map)
        .bindPopup(`<strong>${spot.title}</strong><br/>${spot.loc}`);

      marker.on('click', () => {
        setSelectedId(spot.id);
        onSpotPress?.(spot);
      });
      markersRef.current.push(marker);
    });

    if (filtered.length > 0) {
      const lats = filtered.map((s) => s.coords.latitude);
      const lngs = filtered.map((s) => s.coords.longitude);
      const bounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [filtered, selectedId, colors.accent, full.primary]);

  // Route line + distance + ETA for the selected spot (OSRM, free, no key).
  useEffect(() => {
    let stale = false;
    setRoute(null);
    setRouteError('');
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    if (!selected || !userLoc || !mapInstanceRef.current) return;
    setRouteLoading(true);
    fetchRoute(userLoc, selected.coords)
      .then((r) => {
        if (stale) return;
        setRoute(r);
        routeLineRef.current = L.polyline(
          r.coords.map((c) => [c.latitude, c.longitude]),
          { color: full.primary, weight: 5 }
        ).addTo(mapInstanceRef.current);
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

  const recenter = () => {
    if (!userLoc || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([userLoc.latitude, userLoc.longitude], 13);
  };

  const openExternal = (spot) => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${spot.coords.latitude},${spot.coords.longitude}`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: full.background }]}>
      <View style={styles.mapContainer}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {userLoc && (
          <TouchableOpacity
            onPress={recenter}
            style={[
              styles.recenter,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.recenterText, { color: colors.accent }]}>
              {'\u25CE'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={[
          styles.spotsPanel,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.search,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: full.background,
            },
          ]}
          placeholder="Search spots..."
          placeholderTextColor={colors.subText}
          value={query}
          onChangeText={setQuery}
        />
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
                    typeFilter === t ? colors.accent : full.background,
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
            Location off — distances hidden.
          </Text>
        )}
        <Text style={[styles.panelTitle, { color: colors.text }]}>
          Nearby Spots
        </Text>
        <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
          {sorted.length > 0 ? (
            sorted.map((spot) => {
              const isSel = spot.id === selectedId;
              const km =
                userLoc && spot.coords
                  ? haversineKm(userLoc, spot.coords)
                  : null;
              return (
                <TouchableOpacity
                  key={spot.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedId(spot.id)}
                  onLongPress={() => onSpotPress?.(spot)}
                  style={[
                    styles.spotCard,
                    {
                      backgroundColor: isSel
                        ? full.muted
                        : full.background,
                      borderColor: isSel
                        ? colors.accent
                        : full.border,
                    },
                  ]}
                >
                  <Image source={{ uri: spot.img }} style={styles.spotThumb} />
                  <View style={styles.spotInfo}>
                    <Text style={[styles.spotTitle, { color: colors.text }]} numberOfLines={1}>
                      {spot.title}
                    </Text>
                    <Text
                      style={[styles.spotLocation, { color: colors.subText }]}
                    >
                      {spot.loc}
                      {km != null ? ` • ${km.toFixed(1)} km` : ''}
                      {(() => {
                        const real = reviewStats[Number(spot.id)];
                        if (real) return ` • \u2605 ${real.avg.toFixed(1)} (${real.count})`;
                        if (spot.rating != null) return ` • \u2605 ${spot.rating.toFixed(1)}`;
                        return '';
                      })()}
                    </Text>
                    {isSel && (
                      <View style={styles.selBtns}>
                        {routeLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.accent}
                          />
                        ) : route ? (
                          <Text
                            style={[
                              styles.routeMeta,
                              { color: colors.accent },
                            ]}
                          >{`${route.distanceKm.toFixed(1)} km • ${formatEta(route.etaMin)}`}</Text>
                        ) : null}
                        {routeError ? (
                          <Text
                            style={[
                              styles.routeErr,
                              { color: full.destructive },
                            ]}
                          >
                            {routeError}
                          </Text>
                        ) : null}
                        <View style={styles.btnRow}>
                          <TouchableOpacity
                            onPress={() => openExternal(spot)}
                            style={[
                              styles.btn,
                              { backgroundColor: colors.accent },
                            ]}
                          >
                            <Text
                              style={[
                                styles.btnText,
                                { color: full.accentForeground },
                              ]}
                            >
                              Directions
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onSpotPress?.(spot)}
                            style={[
                              styles.btn,
                              { backgroundColor: full.muted },
                            ]}
                          >
                            <Text
                              style={[
                                styles.btnText,
                                { color: colors.text },
                              ]}
                            >
                              Details
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                No spots match
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', padding: 12, gap: 12 },
  mapContainer: { flex: 1, height: '100%', borderRadius: 12, overflow: 'hidden' },
  recenter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterText: { fontSize: 20, fontWeight: '900' },
  spotsPanel: {
    width: 300,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  search: {
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    fontSize: 14,
  },
  chips: { paddingTop: 8, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  notice: { fontSize: 11, marginTop: 6 },
  panelTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  spotsList: { flex: 1 },
  spotCard: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotThumb: { width: 56, height: 56, borderRadius: 8 },
  spotInfo: { flex: 1, marginLeft: 10 },
  spotTitle: { fontSize: 13, fontWeight: '600' },
  spotLocation: { fontSize: 11, marginTop: 2 },
  selBtns: { marginTop: 8 },
  routeMeta: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  routeErr: { fontSize: 11, marginBottom: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { fontWeight: '800', fontSize: 13 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 12, marginTop: 8 },
});

export default MapComponent;

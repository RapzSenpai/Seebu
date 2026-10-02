import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, AlertCircle } from 'lucide-react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CEBU_CENTER = { lat: 10.3157, lng: 123.8854 };

const createMarkerIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="color:#f7f200;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;border-radius:50%;width:36px;height:36px;font-size:16px;transform:translate(-50%,-50%)">📍</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const MapComponent = ({ spots = [], onSpotPress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [CEBU_CENTER.lat, CEBU_CENTER.lng],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const validSpots = spots.filter((spot) => spot.coords?.latitude);
    if (validSpots.length === 0) return;

    validSpots.forEach((spot) => {
      const marker = L.marker([spot.coords.latitude, spot.coords.longitude], {
        icon: createMarkerIcon(),
      })
        .addTo(map)
        .bindPopup(`<strong>${spot.title}</strong><br/>${spot.loc}`);

      marker.on('click', () => {
        setSelectedSpot(spot);
        onSpotPress?.(spot);
      });
      markersRef.current.push(marker);
    });

    const lats = validSpots.map((s) => s.coords.latitude);
    const lngs = validSpots.map((s) => s.coords.longitude);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [spots]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </View>

      <View style={styles.spotsPanel}>
        <Text style={styles.panelTitle}>Nearby Spots</Text>
        <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
          {spots && spots.length > 0 ? (
            spots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                activeOpacity={0.7}
                onPress={() => onSpotPress?.(spot)}
                style={[
                  styles.spotCard,
                  selectedSpot?.id === spot.id && styles.spotCardActive,
                ]}
              >
                <MapPin size={16} color="#f7f200" />
                <View style={styles.spotInfo}>
                  <Text style={styles.spotTitle}>{spot.title}</Text>
                  <Text style={styles.spotLocation}>{spot.loc}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <AlertCircle size={32} color="#666" />
              <Text style={styles.emptyText}>No spots available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', flexDirection: 'row', padding: 12, gap: 12 },
  mapContainer: { flex: 1, height: '100%', borderRadius: 12, overflow: 'hidden' },
  spotsPanel: { width: 280, backgroundColor: '#111', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a' },
  panelTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  spotsList: { flex: 1 },
  spotCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
  spotCardActive: { backgroundColor: 'rgba(247, 242, 0, 0.1)', borderColor: '#f7f200' },
  spotInfo: { flex: 1, marginLeft: 10 },
  spotTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  spotLocation: { color: '#888', fontSize: 10, marginTop: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#666', fontSize: 12, marginTop: 8 },
});

export default MapComponent;

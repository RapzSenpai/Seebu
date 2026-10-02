import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Linking, 
  Alert, 
  Platform,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  Appearance
} from 'react-native';
import { 
  Bus, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Navigation, 
  ChevronLeft,
  Star,
  Settings // Added for the settings toggle
} from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../ThemeContext';
import GuideList from '../components/GuideList';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const DEFAULT_SPOT = {
  id: 1,
  title: 'Kawasan Falls',
  loc: 'Badian',
  img: 'https://images.unsplash.com/photo-1518107616385-ad302212a99e?w=800',
  coords: { latitude: 9.8034, longitude: 123.3744 },
  transport: {
    terminal: 'South Bus Terminal (Cebu City)',
    busLine: 'Ceres Liner (via Barili)',
    fare: '₱210 - ₱280',
    schedule: 'Every 30 mins (3AM - 9PM)',
    instructions:
      "Board a bus marked 'Bato via Barili'. Tell the conductor to drop you off at the Matutinao Church in Badian.",
  },
};

// Expo Router params are strings, so a pushed object arrives JSON-encoded.
function parseSpotParam(raw) {
  if (!raw) return DEFAULT_SPOT;
  try {
    return { ...DEFAULT_SPOT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SPOT;
  }
}

const SpotDetailScreen = () => {
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const systemColorScheme = useColorScheme();
  
  // State for manual theme override (this allows 'settings' to work)
  // In a real app, this might come from Redux, Context, or AsyncStorage
  const [userThemeSetting, setUserThemeSetting] = useState(null); // 'light' | 'dark' | null (system)

  // Determine actual theme based on user setting or system preference
  const isDarkMode = userThemeSetting ? userThemeSetting === 'dark' : systemColorScheme === 'dark';

  // Dynamic Theme Colors
  const theme = {
    background: isDarkMode ? '#080808' : '#F5F5F7',
    card: isDarkMode ? '#111' : '#FFFFFF',
    text: isDarkMode ? '#FFF' : '#000',
    subtext: isDarkMode ? '#666' : '#8E8E93',
    border: isDarkMode ? '#1a1a1a' : '#E5E5EA',
    tabBar: isDarkMode ? '#111' : '#EFEFF4',
    iconBox: isDarkMode ? '#1a1a1a' : '#F2F2F7',
    instruction: isDarkMode ? '#1a1a1a' : '#F9F9FB',
    accent: '#f7f200'
  };
  
  // Data Extraction from Route Params
  const spot = parseSpotParam(params.spot);

  const [activeTab, setActiveTab] = useState('route'); 
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  // 1. Initialize Location and Permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location to see distance and routes.');
        setLoadingLoc(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(location.coords);
      
      if (spot.coords) {
        const dist = getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          spot.coords.latitude,
          spot.coords.longitude
        );
        setDistance(dist.toFixed(1));
      }
      setLoadingLoc(false);
    })();
  }, []);

  // 2. Helper Logic: Haversine Formula
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // 3. Navigation Intent
  const handleOpenMaps = () => {
    if (!spot.coords) return;
    const latLng = `${spot.coords.latitude},${spot.coords.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${spot.title}&daddr=${latLng}`,
      android: `google.navigation:q=${latLng}`
    });
    Linking.openURL(url);
  };

  // Toggle Function for "Settings"
  const toggleTheme = () => {
    setUserThemeSetting(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER SECTION */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: spot.img }} style={styles.headerImage} />
        <View style={styles.overlay} />
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>

        {/* MOCK SETTINGS TOGGLE (Top Right) */}
        <TouchableOpacity style={styles.settingsBtn} onPress={toggleTheme}>
          <Settings color="#fff" size={24} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{spot.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={16} color={theme.accent} />
            <Text style={[styles.headerLoc, { color: theme.accent }]}> {spot.loc}</Text>
          </View>
        </View>
      </View>

      {/* TABS COMPONENT */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBar }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'route' && { backgroundColor: theme.accent }]} 
          onPress={() => setActiveTab('route')}
        >
          <Navigation size={18} color={activeTab === 'route' ? "#000" : theme.subtext} />
          <Text style={[styles.tabText, { color: activeTab === 'route' ? "#000" : theme.subtext }]}>Route</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guides' && { backgroundColor: theme.accent }]} 
          onPress={() => setActiveTab('guides')}
        >
          <ShieldCheck size={18} color={activeTab === 'guides' ? "#000" : theme.subtext} />
          <Text style={[styles.tabText, { color: activeTab === 'guides' ? "#000" : theme.subtext }]}>Local Guides</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'route' ? (
          <>
            {/* LIVE TRACKING CARD */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Live Route Tracking</Text>
                {loadingLoc ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <View style={[styles.liveBadge, { backgroundColor: isDarkMode ? 'rgba(247, 242, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                    <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.liveText, { color: isDarkMode ? theme.accent : '#000' }]}>GPS ACTIVE</Text>
                  </View>
                )}
              </View>

              <View style={[styles.miniMapContainer, { backgroundColor: theme.iconBox }]}>
                {userLocation && spot.coords ? (
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{
                      latitude: (userLocation.latitude + spot.coords.latitude) / 2,
                      longitude: (userLocation.longitude + spot.coords.longitude) / 2,
                      latitudeDelta: Math.abs(userLocation.latitude - spot.coords.latitude) * 2,
                      longitudeDelta: Math.abs(userLocation.longitude - spot.coords.longitude) * 2,
                    }}
                    customMapStyle={isDarkMode ? mapDarkStyle : []}
                  >
                    <Marker coordinate={userLocation} title="You" pinColor="blue" />
                    <Marker coordinate={spot.coords} title={spot.title} pinColor={theme.accent} />
                  </MapView>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Text style={{color: theme.subtext}}>Fetching map data...</Text>
                  </View>
                )}
              </View>

              <View style={styles.distanceRow}>
                <View>
                  <Text style={[styles.distanceLabel, { color: theme.subtext }]}>Distance from you</Text>
                  <Text style={[styles.distanceValue, { color: theme.text }]}>{distance ? `${distance} km` : "..."}</Text>
                </View>
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.accent }]} onPress={handleOpenMaps}>
                  <Navigation color="#000" size={18} />
                  <Text style={styles.navBtnText}>Go Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
              <Text style={[styles.cardTitle, { marginBottom: 10, color: theme.text }]}>Estimated Travel Expense</Text>
              <View style={[styles.expenseBox, { backgroundColor: isDarkMode ? 'rgba(247, 242, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)' }]}> 
                <Text style={[styles.expenseText, { color: theme.text }]}>{spot.estimatedExpense || '₱200–₱500'}</Text>
              </View>
            </View>

            {/* PUBLIC TRANSPORT GUIDE */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, {marginBottom: 15, color: theme.text}]}>Public Transport</Text>
              
              <View style={styles.transportRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.iconBox }]}><Bus color={isDarkMode ? theme.accent : '#555'} size={20} /></View>
                <View style={{flex: 1}}>
                  <Text style={[styles.transportLabel, { color: theme.subtext }]}>Terminal & Bus</Text>
                  <Text style={[styles.transportValue, { color: theme.text }]}>{spot.transport?.terminal}</Text>
                </View>
              </View>

              <View style={styles.transportRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.iconBox }]}><Clock color={isDarkMode ? theme.accent : '#555'} size={20} /></View>
                <View style={{flex: 1}}>
                  <Text style={[styles.transportLabel, { color: theme.subtext }]}>Fare & Frequency</Text>
                  <Text style={[styles.transportValue, { color: theme.text }]}>{spot.transport?.fare} • {spot.transport?.schedule}</Text>
                </View>
              </View>

              {spot.transport?.options?.map((option, index) => (
                <View key={`${option.vehicle}-${index}`} style={[styles.optionBox, { backgroundColor: isDarkMode ? '#1c1c1c' : '#f7f7f7' }]}> 
                  <Text style={[styles.optionTitle, { color: theme.text }]}>{option.vehicle}</Text>
                  <Text style={[styles.optionMeta, { color: theme.subtext }]}>Fare: {option.fare}</Text>
                  <Text style={[styles.optionMeta, { color: theme.subtext }]}>Frequency: {option.frequency}</Text>
                </View>
              ))}

              <View style={[styles.instructionBox, { backgroundColor: theme.instruction }]}>
                <Text style={[styles.instructionTitle, { color: isDarkMode ? theme.accent : '#000' }]}>Arrival Instructions:</Text>
                <Text style={[styles.instructionText, { color: isDarkMode ? '#aaa' : '#444' }]}>{spot.transport?.instructions}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* GUIDES LIST — Firestore-backed, see components/GuideList.js */}
            <GuideList spot={spot} theme={theme} />
            <View style={{height: 40}} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Map Dark Mode Configuration
const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#484848" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 50 },
  imageContainer: { height: 280, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 25 },
  settingsBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 25 },
  headerTextContainer: { position: 'absolute', bottom: 35, left: 20 },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: '900' },
  headerLoc: { fontWeight: 'bold', fontSize: 16 },

  tabBar: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 15, padding: 6, marginTop: -30, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  tab: { flex: 1, flexDirection: 'row', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 12, gap: 8 },
  tabText: { fontWeight: 'bold' },

  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: 'bold' },

  miniMapContainer: { height: 180, borderRadius: 15, overflow: 'hidden', marginBottom: 15 },
  mapPlaceholder: { flex:1, justifyContent:'center', alignItems:'center' },
  distanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceLabel: { fontSize: 12, marginBottom: 2 },
  distanceValue: { fontSize: 22, fontWeight: '900' },
  expenseBox: { padding: 12, borderRadius: 12 },
  expenseText: { fontSize: 15, fontWeight: '700' },
  navBtn: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, alignItems: 'center', gap: 8 },
  navBtnText: { fontWeight: 'bold', color: '#000' },

  transportRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transportLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  transportValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  optionBox: { padding: 12, borderRadius: 12, marginBottom: 10 },
  optionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  optionMeta: { fontSize: 12, marginTop: 2 },
  instructionBox: { padding: 15, borderRadius: 12, marginTop: 5 },
  instructionTitle: { fontWeight: 'bold', marginBottom: 6, fontSize: 13 },
  instructionText: { lineHeight: 20, fontSize: 13 },

  sectionHeader: { fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  guideCard: { borderRadius: 18, padding: 12, flexDirection: 'row', marginBottom: 15, borderWidth: 1 },
  guideImg: { width: 100, height: 100, borderRadius: 14 },
  guideInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideName: { fontSize: 17, fontWeight: 'bold' },
  guideSpecialty: { fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 4 },
  ratingText: { fontSize: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', gap: 6 },
  contactBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 }
});

export default SpotDetailScreen;

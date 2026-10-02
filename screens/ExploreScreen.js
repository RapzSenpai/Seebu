import React, { useState } from "react";
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, Modal, Image, StatusBar, Dimensions, Platform 
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { Navigation } from 'lucide-react-native'; 
import MapComponent from '../screens/MapComponent'; 
import { useTheme } from '../ThemeContext'; // Integrated Theme Hook
import { router } from 'expo-router';
import { cebuSpots } from '../utils/spots';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
  const { isDarkMode, colors } = useTheme(); // Use Theme Context
  const [searchQuery, setSearchQuery] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const filteredSpots = cebuSpots.filter(spot => 
    spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartNavigation = () => {
    if (selectedSpot) {
      const spotToNavigate = selectedSpot;
      setSelectedSpot(null);
      router.push({ pathname: '/spot', params: { spot: JSON.stringify(spotToNavigate) } });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
      />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.logoText, { color: colors.text }]}>
            SEE<Text style={{ color: colors.accent }}>BU</Text>
          </Text>
          <Text style={[styles.subLogo, { color: colors.subText }]}>Premium Travel Guide</Text>
        </View>
        <TouchableOpacity 
          style={[styles.avatar, { backgroundColor: colors.accent }]} 
          onPress={() => router.push('/profile')}
        >
          <Feather name="user" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* SEARCH SECTION */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]} 
            placeholder="Search destination..." 
            placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
            value={searchQuery} 
            onChangeText={(text) => setSearchQuery(text)} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
               <Feather name="x" size={16} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FEATURED SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery.length > 0 ? "Search Results" : "Featured Spots"}
          </Text>
          <TouchableOpacity onPress={() => setMapVisible(true)}>
            <View style={[styles.mapBadge, { backgroundColor: colors.accent }]}>
              <Feather name="map" size={12} color="#000" />
              <Text style={styles.viewAllText}>Open Map</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL FEATURED CARDS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          snapToInterval={width * 0.8 + 20} 
          decelerationRate="fast"
          contentContainerStyle={styles.featuredScrollContent}
        >
          {filteredSpots.map((spot) => (
            <TouchableOpacity 
              key={spot.id}
              style={styles.featuredCard} 
              onPress={() => setSelectedSpot(spot)}
            >
              <Image source={{ uri: spot.img }} style={styles.featuredImage} />
              <View style={styles.cardOverlay}>
                <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                  <Text style={styles.tagText}>{spot.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.cardTitle}>{spot.title}</Text>
                <View style={styles.locRow}>
                  <Feather name="map-pin" size={12} color={colors.accent} />
                  <Text style={styles.cardLoc}>{spot.loc}</Text>
                </View>
                <View style={styles.expenseRow}>
                  <Feather name="credit-card" size={12} color={colors.accent} />
                  <Text style={styles.cardExpense}>Est. travel: {spot.estimatedExpense}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredSpots.length === 0 && (
            <Text style={{ color: colors.subText, marginLeft: 20 }}>No places found...</Text>
          )}
        </ScrollView>

        {/* DISCOVER MORE SECTION */}
        {filteredSpots.length > 0 && (
            <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 15, marginTop: 10, marginLeft: 20 }]}>
                    Discover More
                </Text>
                
                {filteredSpots.map((spot) => (
                <TouchableOpacity 
                    key={spot.id} 
                    style={[styles.miniCard, { backgroundColor: colors.card }]} 
                    onPress={() => setSelectedSpot(spot)}
                >
                    <Image source={{ uri: spot.img }} style={styles.miniImg} />
                    <View style={styles.miniInfo}>
                    <Text style={[styles.miniTitle, { color: colors.text }]}>{spot.title}</Text>
                    <Text style={[styles.miniLoc, { color: colors.subText }]}>{spot.loc}</Text>
                    <Text style={[styles.miniExpense, { color: colors.accent }]}>Est. travel: {spot.estimatedExpense}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.accent} />
                </TouchableOpacity>
                ))}
            </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MAP MODAL */}
      <Modal visible={mapVisible} animationType="fade" onRequestClose={() => setMapVisible(false)}>
        <View style={[styles.modalFullScreen, { backgroundColor: colors.background }]}>
          <MapComponent
            spots={cebuSpots}
            onSpotPress={(spot) => {
              setMapVisible(false);
              setSelectedSpot(spot);
            }}
          />
          <TouchableOpacity style={[styles.closeMap, { backgroundColor: colors.accent }]} onPress={() => setMapVisible(false)}>
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* SPOT DETAILS MODAL */}
      <Modal visible={!!selectedSpot} animationType="slide" transparent={true}>
        <View style={styles.detailOverlay}>
          <View style={[styles.detailSheet, { backgroundColor: colors.card }]}>
            {selectedSpot && (
              <>
                <Image source={{ uri: selectedSpot.img }} style={styles.detailImg} />
                <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedSpot.title}</Text>
                <Text style={[styles.detailLoc, { color: colors.accent }]}>{selectedSpot.loc}</Text>
                <Text style={[styles.detailExpense, { color: colors.accent }]}>Estimated travel expense: {selectedSpot.estimatedExpense}</Text>
                <Text style={[styles.detailDesc, { color: colors.subText }]}>{selectedSpot.desc}</Text>
                
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.accent }]} onPress={handleStartNavigation}>
                  <Navigation color="#000" size={20} />
                  <Text style={styles.navBtnText}>Start Navigation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]} onPress={() => setSelectedSpot(null)}>
                  <Text style={[styles.closeBtnText, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 ,
    paddingBottom: 50
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    marginBottom: 20 
  },
  logoText: { fontSize: 22, fontWeight: "900" },
  subLogo: { fontSize: 10, letterSpacing: 2 },
  avatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  searchSection: { paddingHorizontal: 20, marginBottom: 20 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10 },
  content: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  mapBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewAllText: { color: "#000", fontSize: 12, fontWeight: '700', marginLeft: 4 },
  featuredScrollContent: { paddingLeft: 20, paddingRight: 10, paddingBottom: 20 },
  featuredCard: { width: width * 0.8, height: 250, borderRadius: 20, overflow: 'hidden', marginRight: 15 },
  featuredImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: 15, backgroundColor: 'rgba(0,0,0,0.6)' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 5 },
  tagText: { color: '#000', fontSize: 10, fontWeight: '900' },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardLoc: { color: '#ccc', fontSize: 13, marginLeft: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  expenseRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardExpense: { color: '#f7f200', fontSize: 12, marginLeft: 4, fontWeight: '700' },
  miniCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 15, marginBottom: 10, marginHorizontal: 20 },
  miniImg: { width: 50, height: 50, borderRadius: 10 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { fontWeight: '700' },
  miniLoc: { fontSize: 12 },
  miniExpense: { fontSize: 11, marginTop: 2, fontWeight: '700' },
  modalFullScreen: { flex: 1 },
  closeMap: { position: 'absolute', top: 40, right: 20, padding: 10, borderRadius: 25, zIndex: 99 },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  detailSheet: { padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  detailImg: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15 },
  detailTitle: { fontSize: 22, fontWeight: '900' },
  detailLoc: { marginBottom: 6 },
  detailExpense: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  detailDesc: { lineHeight: 20, marginBottom: 20 },
  navBtn: { 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  navBtnText: { 
    fontWeight: '800', 
    color: '#000', 
    marginLeft: 8, 
    fontSize: 16 
  },
  closeBtn: { 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  closeBtnText: { 
    fontWeight: '700'
  }
});

export default ExploreScreen;
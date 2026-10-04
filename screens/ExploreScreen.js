import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, StatusBar, Dimensions, Platform,
  ActivityIndicator
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { Navigation, Star, Bookmark } from 'lucide-react-native';
import { useTheme } from '../ThemeContext'; // Integrated Theme Hook
import { useColorScheme } from '../lib/useColorScheme';
import IslandBackground from '../components/IslandBackground';
import BottomSheetModal from '../components/BottomSheetModal';
import SpotGallery from '../components/SpotGallery';
import { router, useFocusEffect } from 'expo-router';
import { useSpots } from '../utils/useSpots';
import { useReviewStats } from '../utils/useReviewStats';
import { useUser } from '../UserContext';
import { auth } from '../firebase';
import { useSavedPlaces } from '../utils/useSavedPlaces';
import { cx } from '../utils/cloudinary';

const { width } = Dimensions.get('window');

const CATS = ['All', 'Beach', 'Nature', 'History', 'Adventure'];

// ponytail: chips derive from data, no new dep. Filter = search AND chip.
const ExploreScreen = () => {
  const { isDarkMode, colors } = useTheme(); // Use Theme Context
  const { colors: full } = useColorScheme();
  const { spots, refresh: refreshSpots } = useSpots();
  // DATA-03: the catalog was one-shot — refresh every visit so another
  // admin's publish (or your own) shows without a restart.
  useFocusEffect(
    React.useCallback(() => {
      refreshSpots();
    }, [refreshSpots])
  );
  const { stats: reviewStats } = useReviewStats();
  const { profile } = useUser();
  const { isSaved, toggleSave, busy: saveBusy } = useSavedPlaces();
  const avatarImg = profile?.profileImg || auth.currentUser?.photoURL;
  const avatarInitial = (
    profile?.displayName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    'T'
  ).charAt(0).toUpperCase();
  // ponytail: real avg/count wins when real reviews exist; static otherwise.
  const ratingOf = (spot) => {
    const real = reviewStats[Number(spot.id)];
    if (real) return { value: real.avg, count: real.count };
    if (spot.rating != null) return { value: spot.rating, count: spot.reviewsCount ?? null };
    return null;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selectedSpot, setSelectedSpot] = useState(null);
  // ponytail: the write's return value is ground truth for this sheet.
  // Deriving from context alone left the button stale while Settings (fresh
  // mount) already showed saved. sheetOverride MUST be declared AFTER
  // selectedSpot so the derivation reads the correct value.
  const [sheetOverride, setSheetOverride] = useState(null);
  const sheetSaved = selectedSpot
    ? (sheetOverride ?? isSaved(selectedSpot.id))
    : false;
  useEffect(() => {
    setSheetOverride(null);
  }, [selectedSpot?.id]);

  // PERF-03: filters rebuild only when inputs change — every keystroke
  // re-renders anyway, but tab switches/theme flips no longer recompute.
  const counts = useMemo(() => {
    const c = {};
    spots.forEach((s) => {
      c[s.type] = (c[s.type] || 0) + 1;
    });
    return c;
  }, [spots]);

  const q = searchQuery.trim().toLowerCase();
  const filteredSpots = useMemo(
    () =>
      spots.filter((spot) =>
        (activeCat === 'All' || (spot.type || 'Spot') === activeCat) &&
        (!q ||
          (spot.title || '').toLowerCase().includes(q) ||
          (spot.loc || '').toLowerCase().includes(q))
      ),
    [spots, activeCat, q]
  );
  const railSpots = useMemo(() => filteredSpots.slice(0, 5), [filteredSpots]);
  const isFiltering = q.length > 0 || activeCat !== 'All';

  const handleStartNavigation = () => {
    if (selectedSpot) {
      const spotToNavigate = selectedSpot;
      setSelectedSpot(null);
      router.push({ pathname: '/spot', params: { spot: JSON.stringify(spotToNavigate) } });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, flex: 1 }]}>
      <IslandBackground />
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
        <TouchableOpacity onPress={() => router.push('/profile')}>
          {avatarImg ? (
            <Image source={{ uri: avatarImg }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: full.accentForeground }]}>{avatarInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* GREETING */}
        <Text style={[styles.greeting, { color: colors.text }]}>Where to in Cebu?</Text>

        {/* SEARCH SECTION */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={18} color={colors.subText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search waterfalls, towns, beaches..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CATS.map((cat) => {
              const active = activeCat === cat;
              const count = cat === 'All' ? spots.length : (counts[cat] || 0);
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCat(cat)}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.card },
                    active && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.subText },
                      active && { color: full.accentForeground },
                    ]}
                  >
                    {cat} · {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FEATURED SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isFiltering ? "Matching Spots" : "Featured Spots"}
          </Text>
        </View>

        {/* EDITORIAL FEATURED CARDS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.78 + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.featuredScrollContent}
        >
          {railSpots.map((spot) => {
            const rr = ratingOf(spot);
            return (
            <TouchableOpacity
              key={spot.id}
              style={styles.featuredCard}
              onPress={() => setSelectedSpot(spot)}
              activeOpacity={0.92}
            >
              <Image source={{ uri: cx(spot.img, 800) }} style={styles.featuredImage} />
              <View style={styles.scrim} />
              <View style={styles.featuredTop}>
                <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tagText, { color: full.accentForeground }]}>{(spot.type || 'Spot').toUpperCase()}</Text>
                </View>
                {rr && (
                  <View style={styles.ratingPill}>
                    <Star size={11} color="#fff" fill="#fff" />
                    <Text style={styles.ratingText}>{rr.value.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.featuredBottom}>
                <Text style={styles.featuredTitle} numberOfLines={2}>{spot.title}</Text>
                <View style={styles.locRow}>
                  <Feather name="map-pin" size={12} color="#fff" />
                  <Text style={styles.featuredLoc}>{spot.loc}</Text>
                </View>
                <Text style={styles.featuredExpense}>Est. travel: {spot.estimatedExpense}</Text>
              </View>
            </TouchableOpacity>
            );
          })}
          {railSpots.length === 0 && (
            <View style={[styles.emptyRail, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches here</Text>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                {q ? `Nothing for "${searchQuery.trim()}"` : 'Nothing under this filter'} — try another place or town.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* DISCOVER MORE SECTION */}
        {filteredSpots.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 15, marginTop: 10, marginLeft: 20 }]}>
              Discover More
            </Text>

            {filteredSpots.map((spot) => {
              const rr = ratingOf(spot);
              return (
              <TouchableOpacity
                key={spot.id}
                style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedSpot(spot)}
              >
                <Image source={{ uri: cx(spot.img, 400) }} style={styles.miniImg} />
                <View style={styles.miniInfo}>
                  <Text style={[styles.miniTitle, { color: colors.text }]} numberOfLines={1}>{spot.title}</Text>
                  <Text style={[styles.miniLoc, { color: colors.subText }]}>{spot.loc}</Text>
                  <Text style={[styles.miniMeta, { color: colors.subText }]} numberOfLines={1}>
                    {rr ? `★ ${rr.value.toFixed(1)}${rr.count != null ? ` (${rr.count})` : ''} · ` : ''}Est. {spot.estimatedExpense}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.accent} />
              </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* SPOT DETAILS SHEET — same shared sheet as Logout: themed card,
          standard backdrop, swipe-down to close. */}
      <BottomSheetModal
        visible={!!selectedSpot}
        onClose={() => setSelectedSpot(null)}
        snapPoints={['85%']}
      >
        {selectedSpot && (
          <ScrollView showsVerticalScrollIndicator={false}>
                {(!!selectedSpot.img || (selectedSpot.photos || []).length > 0) && (
                  <View style={styles.detailGallery}>
                    <SpotGallery img={selectedSpot.img} photos={selectedSpot.photos} dotsTop={160} />
                  </View>
                )}
                <View style={styles.detailHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailTitle, { color: colors.text }]} numberOfLines={2}>{selectedSpot.title}</Text>
                    <Text style={[styles.detailLoc, { color: colors.accent }]}>{selectedSpot.loc}</Text>
                  </View>
                  {(() => {
                    const rr = ratingOf(selectedSpot);
                    return rr ? (
                      <View style={[styles.detailRating, { backgroundColor: colors.accent }]}>
                        <Star size={12} color={full.accentForeground} fill={full.accentForeground} />
                        <Text style={[styles.detailRatingText, { color: full.accentForeground }]}>
                          {rr.value.toFixed(1)}
                        </Text>
                      </View>
                    ) : null;
                  })()}
                </View>
                <Text style={[styles.detailExpense, { color: colors.accent }]}>Estimated travel expense: {selectedSpot.estimatedExpense}</Text>
                <Text style={[styles.detailDesc, { color: colors.subText }]} numberOfLines={3}>{selectedSpot.desc}</Text>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { borderColor: colors.accent },
                    sheetSaved && { backgroundColor: colors.accent },
                    saveBusy && { opacity: 0.6 },
                  ]}
                  onPress={async () => {
                    const nowSaved = await toggleSave(selectedSpot.id);
                    setSheetOverride(nowSaved);
                  }}
                  disabled={saveBusy}
                >
                  {saveBusy ? (
                    <ActivityIndicator size="small" color={sheetSaved ? full.accentForeground : colors.accent} />
                  ) : (
                    <Bookmark
                      size={18}
                      color={sheetSaved ? full.accentForeground : colors.accent}
                      fill={sheetSaved ? full.accentForeground : 'transparent'}
                    />
                  )}
                  <Text
                    style={[
                      styles.saveBtnText,
                      { color: sheetSaved ? full.accentForeground : colors.accent },
                    ]}
                  >
                    {saveBusy ? 'Saving…' : sheetSaved ? 'Saved' : 'Save Place'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.accent }]} onPress={handleStartNavigation}>
                  <Navigation color={full.accentForeground} size={20} />
                  <Text style={[styles.navBtnText, { color: full.accentForeground }]}>Start Navigation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: full.muted }]} onPress={() => setSelectedSpot(null)}>
                  <Text style={[styles.closeBtnText, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
          </ScrollView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 6
  },
  logoText: { fontSize: 22, fontWeight: "900" },
  subLogo: { fontSize: 10, letterSpacing: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900' },
  greeting: { fontSize: 26, fontWeight: '900', letterSpacing: -0.3, paddingHorizontal: 20, marginTop: 8 },
  searchSection: { paddingHorizontal: 20, marginTop: 14, marginBottom: 20 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 15, height: 52, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  chips: { paddingTop: 12, gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '700' },
  content: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  featuredScrollContent: { paddingLeft: 20, paddingRight: 10, paddingBottom: 20 },
  featuredCard: { width: width * 0.78, height: 300, borderRadius: 20, overflow: 'hidden', marginRight: 16, backgroundColor: '#0E1B2C' },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 17, 30, 0.45)' },
  featuredTop: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 10, fontWeight: '900' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(6, 17, 30, 0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  featuredBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  featuredTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  featuredLoc: { fontSize: 13, marginLeft: 4, color: '#fff', fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  featuredExpense: { fontSize: 12, marginTop: 6, fontWeight: '700', color: '#fff', opacity: 0.9 },
  emptyRail: { width: width * 0.78, borderRadius: 20, borderWidth: 1, padding: 22, marginRight: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 13, marginTop: 6, lineHeight: 19 },
  miniCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, borderWidth: 1, marginBottom: 10, marginHorizontal: 20 },
  miniImg: { width: 64, height: 64, borderRadius: 12 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { fontWeight: '700', fontSize: 15 },
  miniLoc: { fontSize: 12, marginTop: 1 },
  miniMeta: { fontSize: 12, marginTop: 3, fontWeight: '600' },

  detailGallery: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailTitle: { fontSize: 22, fontWeight: '900' },
  detailLoc: { marginTop: 2, fontWeight: '600' },
  detailRating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  detailRatingText: { fontWeight: '800', fontSize: 13 },
  detailExpense: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  detailDesc: { lineHeight: 20, marginVertical: 10, fontSize: 14 },
  saveBtn: {
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10
  },
  saveBtnText: {
    fontWeight: '800',
    fontSize: 16
  },
  navBtn: {
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  navBtnText: {
    fontWeight: '800',
    marginLeft: 8,
    fontSize: 16
  },
  closeBtn: {
    padding: 15,
    borderRadius: 16,
    alignItems: 'center'
  },
  closeBtnText: {
    fontWeight: '700'
  }
});

export default ExploreScreen;

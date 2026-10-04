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
  Bookmark,
  Settings,
  Map as MapIcon
} from 'lucide-react-native';
// NOTE: Location is not supported on web, so we skip the import and location tracking
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import GuideList from '../components/GuideList';
import SpotGallery from '../components/SpotGallery';
import ReviewComposer from '../components/ReviewComposer';
import BottomSheetModal from '../components/BottomSheetModal';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Section, FactRow, Stars, ReviewCard, EmptyState } from '../components/SpotInfo';
import { router, useLocalSearchParams } from 'expo-router';
import { auth } from '../firebase';
import { useUser } from '../UserContext';
import { useReviewStats } from '../utils/useReviewStats';
import { useSavedPlaces } from '../utils/useSavedPlaces';
import { useSpots } from '../utils/useSpots';

// Expo Router params are strings, so a pushed object arrives JSON-encoded.
// Missing/corrupt params resolve to null — never a fake spot (BUG-02).
function parseSpotParam(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

const SpotDetailScreen = () => {
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();

  // Token-built adapter for GuideList (expects subtext key).
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text,
    subtext: colors.subText,
    subText: colors.subText,
    accent: colors.accent,
    border: colors.border,
    tabBar: colors.card,
    iconBox: full.muted,
    instruction: full.muted,
  };

  // Data: resolve the pushed snapshot against the live catalog (DATA-01).
  // Live wins when present; snapshot stays as the offline fallback.
  const snap = parseSpotParam(params.spot);
  const { spots: liveSpots } = useSpots();
  const snapId = Number(snap?.spotId ?? snap?.id);
  const live = Number.isFinite(snapId)
    ? liveSpots.find((s) => Number(s.spotId ?? s.id) === snapId) ?? null
    : null;
  const spot = live ?? snap;

  // Real reviews: stats + own review for the composer.
  const { stats, listFor, refresh: refreshReviews } = useReviewStats();
  const { profile } = useUser();
  const uid = auth.currentUser?.uid;
  const displayName =
    profile?.displayName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'Traveller';
  const ownReview = uid ? listFor(spot?.id).find((r) => r.uid === uid) ?? null : null;
  const { isSaved, toggleSave, busy: saveBusy } = useSavedPlaces();
  const heroSaved = isSaved(spot?.id);
  const realStat = spot ? stats[Number(spot.id)] ?? null : null;
  const realList = listFor(spot?.id);
  const heroRating = realStat
    ? { value: realStat.avg, count: realStat.count }
    : spot?.rating != null
      ? { value: spot.rating, count: spot.reviewsCount ?? null }
      : null;
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('route');
  const [distance, setDistance] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // On web, we skip location tracking
  useEffect(() => {
    setLoadingLoc(false);
  }, []);

  // 3. Navigation Intent (for web, open Google Maps in a new tab)
  const handleOpenMaps = () => {
    if (!spot.coords) return;
    const latLng = `${spot.coords.latitude},${spot.coords.longitude}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
    if (Platform.OS === 'web') {
      window.open(mapsUrl, '_blank');
    } else {
      Linking.openURL(mapsUrl);
    }
  };

  // Gear opens real Settings (theme toggle lives there, not here).
  const openSettings = () => {
    router.push('/(tabs)/settings');
  };

  const activeTabFg = full.accentForeground;

  // BUG-02: no params (or corrupt JSON) shows not-found, never a fake spot.
  if (!spot) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 }}>Spot not found</Text>
        <Text style={{ fontSize: 14, color: colors.subText, textAlign: 'center', marginBottom: 16 }}>
          This spot may have been removed or the link is invalid.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}
        >
          <Text style={{ color: full.accentForeground, fontWeight: '700' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SECTION */}
      <View style={styles.imageContainer}>
        <SpotGallery img={spot.img} photos={spot.photos} />
        <View style={[styles.overlayBase, { backgroundColor: full.foreground, opacity: 0.5 }]} />

        <TouchableOpacity style={[styles.backBtnBase, { backgroundColor: full.muted }]} onPress={() => router.back()}>
          <ChevronLeft color={full.foreground} size={28} />
        </TouchableOpacity>

        {/* SAVE (Top Right) */}
        <TouchableOpacity
          style={[styles.backBtnBase, styles.savedPos, { backgroundColor: full.muted }, saveBusy && { opacity: 0.6 }]}
          onPress={() => toggleSave(spot.id)}
          disabled={saveBusy}
        >
          <Bookmark
            color={heroSaved ? colors.accent : full.foreground}
            fill={heroSaved ? colors.accent : 'transparent'}
            size={22}
          />
        </TouchableOpacity>

        {/* SETTINGS (Top Right) */}
        <TouchableOpacity style={[styles.backBtnBase, styles.settingsPos, { backgroundColor: full.muted }]} onPress={openSettings}>
          <Settings color={full.foreground} size={24} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: full.primaryForeground }]} numberOfLines={2}>{spot.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={16} color={full.primaryForeground} />
            <Text style={[styles.headerLoc, { color: full.primaryForeground }]}> {spot.loc}</Text>
          </View>
        </View>
      </View>

      {/* INFO STRIP — rating + expense overlapping hero bottom */}
      <View style={[styles.infoStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {heroRating ? (
          <View style={styles.infoItemFirst}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Rating</Text>
            <View style={styles.infoValueRow}>
              <Star size={13} color={colors.accent} fill={colors.accent} />
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {heroRating.value.toFixed(1)}
                {heroRating.count != null ? <Text style={[styles.infoSub, { color: colors.subText }]}> ({heroRating.count})</Text> : null}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={[styles.infoItem, spot.rating == null && styles.infoItemFirst, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.subText }]}>Est. travel</Text>
          <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{spot.estimatedExpense || '₱200–₱500'}</Text>
        </View>
        <View style={[styles.infoItem, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.subText }]}>Category</Text>
          <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{spot.type || 'Spot'}</Text>
        </View>
      </View>

      {/* TABS COMPONENT */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBar, shadowColor: '#000' }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'route' && { backgroundColor: colors.accent }]}
          onPress={() => setActiveTab('route')}
        >
          <Navigation size={14} color={activeTab === 'route' ? activeTabFg : colors.subText} />
          <Text numberOfLines={1} style={[styles.tabText, { color: activeTab === 'route' ? activeTabFg : colors.subText }]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && { backgroundColor: colors.accent }]}
          onPress={() => setActiveTab('details')}
        >
          <Star size={14} color={activeTab === 'details' ? activeTabFg : colors.subText} />
          <Text numberOfLines={1} style={[styles.tabText, { color: activeTab === 'details' ? activeTabFg : colors.subText }]}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'guides' && { backgroundColor: colors.accent }]}
          onPress={() => setActiveTab('guides')}
        >
          <ShieldCheck size={14} color={activeTab === 'guides' ? activeTabFg : colors.subText} />
          <Text numberOfLines={1} style={[styles.tabText, { color: activeTab === 'guides' ? activeTabFg : colors.subText }]}>Local Guides</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} removeClippedSubviews>
        {activeTab === 'route' ? (
          <>
            {/* LIVE TRACKING CARD - WEB VERSION (no map) */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Location Information</Text>
              </View>

              <View style={[styles.miniMapContainer, { backgroundColor: full.muted }]}>
                <View style={styles.mapPlaceholder}>
                  <MapIcon size={48} color={colors.subText} />
                  <Text style={[styles.mapPlaceholderText, { color: colors.text, marginTop: 12 }]}>View on Web</Text>
                  <Text style={[styles.mapPlaceholderSubText, { color: colors.subText }]}>Click "Open Map" to view the location</Text>
                </View>
              </View>

              <View style={styles.distanceRow}>
                <View>
                  <Text style={[styles.distanceLabel, { color: colors.subText }]}>Coordinates</Text>
                  <Text style={[styles.distanceValue, { color: colors.text }]}>
                    {spot.coords ? `${spot.coords.latitude.toFixed(4)}, ${spot.coords.longitude.toFixed(4)}` : "N/A"}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.accent }]} onPress={handleOpenMaps}>
                  <Navigation color={full.accentForeground} size={18} />
                  <Text style={[styles.navBtnText, { color: full.accentForeground }]}>Open Map</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* PUBLIC TRANSPORT GUIDE */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { marginBottom: 15, color: colors.text }]}>Public Transport</Text>

              <View style={styles.transportRow}>
                <View style={[styles.iconBox, { backgroundColor: full.muted }]}><Bus color={isDarkMode ? colors.accent : colors.subText} size={20} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.transportLabel, { color: colors.subText }]}>Terminal & Bus</Text>
                  <Text style={[styles.transportValue, { color: colors.text }]}>{spot.transport?.terminal}</Text>
                </View>
              </View>

              <View style={styles.transportRow}>
                <View style={[styles.iconBox, { backgroundColor: full.muted }]}><Clock color={isDarkMode ? colors.accent : colors.subText} size={20} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.transportLabel, { color: colors.subText }]}>Fare & Frequency</Text>
                  <Text style={[styles.transportValue, { color: colors.text }]}>{spot.transport?.fare} • {spot.transport?.schedule}</Text>
                </View>
              </View>

              {spot.transport?.options?.map((option, index) => (
                <View key={`${option.vehicle}-${index}`} style={[styles.optionBox, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{option.vehicle}</Text>
                  <Text style={[styles.optionMeta, { color: colors.subText }]}>Fare: {option.fare}</Text>
                  <Text style={[styles.optionMeta, { color: colors.subText }]}>Frequency: {option.frequency}</Text>
                </View>
              ))}

              <View style={[styles.instructionBox, { backgroundColor: full.muted }]}>
                <Text style={[styles.instructionTitle, { color: isDarkMode ? colors.accent : colors.text }]}>Arrival Instructions:</Text>
                <Text style={[styles.instructionText, { color: colors.subText }]}>{spot.transport?.instructions}</Text>
              </View>
            </View>
          </>
        ) : activeTab === 'details' ? (
          <>
            <Section title="About" colors={colors} full={full}>
              <Text style={{ color: colors.text, lineHeight: 24, fontSize: 15 }}>
                {spot.longDesc || spot.desc}
              </Text>
            </Section>

            <Section title="Location" colors={colors} full={full}>
              <FactRow label="Address" value={spot.address} colors={colors} />
              <FactRow label="Getting there" value={spot.howToGetThere} colors={colors} />
              {spot.coords && (
                <Text style={{ color: colors.subText, fontSize: 13 }}>
                  {`${spot.coords.latitude.toFixed(4)}, ${spot.coords.longitude.toFixed(4)}`}
                </Text>
              )}
              {!spot.address && !spot.howToGetThere && (
                <EmptyState text={spot.loc} colors={colors} />
              )}
            </Section>

            <Section title="Hours & Fees" colors={colors} full={full}>
              <FactRow label="Hours" value={spot.hours} colors={colors} />
              <FactRow label="Fees" value={spot.fees} colors={colors} />
              {!spot.hours && !spot.fees && (
                <EmptyState text="Hours and fees not listed yet." colors={colors} />
              )}
            </Section>

            <Section title="Tips" colors={colors} full={full}>
              <FactRow label="Best time" value={spot.bestTime} colors={colors} />
              <FactRow label="Duration" value={spot.duration} colors={colors} />
              {(spot.tips || []).map((tip, i) => (
                <Text key={i} style={{ color: colors.subText, fontSize: 14, lineHeight: 22, marginTop: 4 }}>
                  {`\u2022 ${tip}`}
                </Text>
              ))}
              {!spot.bestTime && !spot.duration && !(spot.tips || []).length && (
                <EmptyState text="No tips yet." colors={colors} />
              )}
            </Section>

            <Section title="Suggested Itinerary" colors={colors} full={full}>
              {(spot.itinerary || []).map((step, i, arr) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.accent }]} />
                    {i < arr.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 13 }}>{step.t}</Text>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 2 }}>{step.title}</Text>
                    <Text style={{ color: colors.subText, fontSize: 13, lineHeight: 20 }}>{step.text}</Text>
                  </View>
                </View>
              ))}
              {!(spot.itinerary || []).length && (
                <EmptyState text="No itinerary yet." colors={colors} />
              )}
            </Section>

            {!!uid && (
              <ReviewComposer
                spotId={spot.id}
                existing={ownReview}
                uid={uid}
                displayName={displayName}
                colors={colors}
                full={full}
                onDone={refreshReviews}
              />
            )}
            <Section title="Reviews" colors={colors} full={full}>
              {realList.length > 0 ? (
                <>
                  <Stars value={realStat.avg} count={realStat.count} colors={colors} full={full} />
                  <View style={{ height: 12 }} />
                  {realList.slice(0, 2).map((r) => (
                    <ReviewCard
                      key={r.id ?? r.uid}
                      review={{ n: r.displayName, r: r.rating, t: r.text }}
                      colors={colors}
                      full={full}
                    />
                  ))}
                  <TouchableOpacity onPress={() => setReviewsOpen(true)} style={styles.moreBtn}>
                    <Text style={[styles.moreText, { color: colors.accent }]}>
                      View More Comments ({realList.length})
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Stars value={spot.rating} count={spot.reviewsCount} colors={colors} full={full} />
                  <View style={{ height: 12 }} />
                  {(spot.reviews || []).map((r, i) => (
                    <ReviewCard key={i} review={r} colors={colors} full={full} />
                  ))}
                  {!(spot.reviews || []).length && (
                    <EmptyState text="No reviews yet." colors={colors} />
                  )}
                </>
              )}
            </Section>
            <View style={{ height: 40 }} />
          </>
        ) : (
          <>
            {/* GUIDES LIST — Firestore-backed, see components/GuideList.js */}
            <GuideList spot={spot} theme={theme} />
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* FULL REVIEW LIST */}
      <BottomSheetModal
        visible={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        title={`Reviews (${realList.length})`}
        snapPoints={['85%']}
        initialSnap={0}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {realList.map((r) => (
            <ReviewCard
              key={r.id ?? r.uid}
              review={{ n: r.displayName, r: r.rating, t: r.text }}
              colors={colors}
              full={full}
            />
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 50 },
  imageContainer: { height: 320, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  overlayBase: { ...StyleSheet.absoluteFillObject },
  backBtnBase: { position: 'absolute', top: 50, left: 20, width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  settingsPos: { left: undefined, right: 20 },
  savedPos: { left: undefined, right: 68 },
  headerTextContainer: { position: 'absolute', bottom: 52, left: 20, right: 20 },
  headerTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -0.3 },
  headerLoc: { fontWeight: 'bold', fontSize: 16 },

  infoStrip: {
    flexDirection: 'row', marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    paddingVertical: 12, paddingHorizontal: 8, marginTop: -28, marginBottom: 14,
    elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8,
  },
  infoItemFirst: { flex: 1, paddingHorizontal: 8 },
  infoItem: { flex: 1, paddingHorizontal: 8, borderLeftWidth: 1 },
  infoLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoValue: { fontSize: 14, fontWeight: '800' },
  infoSub: { fontSize: 11, fontWeight: '600' },

  tabBar: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginHorizontal: 20, borderRadius: 16, paddingVertical: 5, paddingHorizontal: 4, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tab: { flexDirection: 'row', minWidth: 88, paddingVertical: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 12, gap: 5 },
  tabText: { fontWeight: '700', fontSize: 11.5 },

  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: 'bold' },

  miniMapContainer: { height: 180, borderRadius: 15, overflow: 'hidden', marginBottom: 15 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapPlaceholderText: { fontSize: 16, fontWeight: '600' },
  mapPlaceholderSubText: { fontSize: 12, marginTop: 4 },
  distanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceLabel: { fontSize: 12, marginBottom: 2 },
  distanceValue: { fontSize: 22, fontWeight: '900' },
  expenseBox: { padding: 12, borderRadius: 12 },
  expenseText: { fontSize: 15, fontWeight: '700' },
  navBtn: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16, alignItems: 'center', gap: 8 },
  navBtnText: { fontWeight: 'bold' },

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

  moreBtn: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  moreText: { fontWeight: '800', fontSize: 14 },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineRail: { width: 20, alignItems: 'center', marginRight: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, minHeight: 24, marginTop: 4 },

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
  contactBtnText: { fontWeight: 'bold', fontSize: 13 }
});

export default SpotDetailScreen;

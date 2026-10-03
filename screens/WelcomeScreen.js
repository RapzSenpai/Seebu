import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ArrowRight, MapPin } from 'lucide-react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import IslandBackground from '../components/IslandBackground';
import { cebuSpots } from '../utils/spots';

const { width } = Dimensions.get('window');

// Reading this as: mobile tourism landing for first-time travelers, with a
// premium calm language, leaning toward existing SeeBu tokens + StyleSheet.
const PHOTOS = [
  {
    id: 'kawasan',
    uri: 'https://sugbo.ph/wp-content/uploads/2020/06/Kawasan-Falls-Cebu-The-Island-Nomad-1-1536x1023.jpg',
    label: 'Kawasan Falls',
    rotate: '-6deg',
  },
  {
    id: 'oslob',
    uri: 'https://i0.wp.com/www.projectlupad.com/wp-content/uploads/2018/02/Whale-Shark-Oslob-Cebu-Philippines-Aerial-View-Project-LUPAD.jpeg',
    label: 'Oslob Whale Sharks',
    rotate: '5deg',
  },
  {
    id: 'island',
    local: require('../assets/island.jpg'),
    label: 'Moalboal Coast',
    rotate: '-2deg',
  },
];

const PIN_POSITIONS = [
  { left: '38%', top: '64%' },
  { left: '45%', top: '76%' },
  { left: '44%', top: '40%' },
  { left: '56%', top: '40%' },
  { left: '40%', top: '48%' },
];

// ponytail: RN-native draggable photo, no web shadcn dep. Thin border only,
// no heavy card frame. Drag stays where dropped, subtle spring on release.
const DraggablePhoto = ({ source, label, rotate, border, badgeBg, badgeColor }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const [z, setZ] = useState(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.06, { damping: 15, stiffness: 300 });
    })
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate },
      { scale: scale.value },
    ],
    zIndex: z,
  }));

  return (
    <GestureDetector gesture={pan} onBegan={() => setZ(10)} onEnded={() => setZ(1)}>
      <Animated.View style={[styles.photoWrap, { borderColor: border }, style]}>
        <Image source={source} style={styles.photo} resizeMode="cover" />
        <View style={[styles.photoTag, { backgroundColor: badgeBg }]}>
          <Text style={[styles.photoTagText, { color: badgeColor }]}>{label}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const WelcomeScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const featured = cebuSpots.slice(0, 5);
  const water = isDarkMode ? '#0B1E2E' : '#D9EAF4';
  const land = isDarkMode ? '#1C2A3A' : '#EFF6EC';
  const road = isDarkMode ? '#3A4D63' : '#FFFFFF';
  const park = isDarkMode ? '#1E4033' : '#CDE8CF';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <IslandBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.brand, { color: colors.text }]}>
            SEE<Text style={{ color: colors.accent }}>BU</Text>
          </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.signIn, { color: colors.accent }]}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Welcome */}
        <View style={styles.hero}>
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.logoText, { color: full.accentForeground }]}>S</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            See Cebu{'\n'}differently.
          </Text>
          <Text style={[styles.heroSub, { color: colors.subText }]}>
            Waterfalls, islands, and old-town stories — all in one guide.
          </Text>
        </View>

        <View style={styles.photoRow}>
          {PHOTOS.map((p) => (
            <DraggablePhoto
              key={p.id}
              source={p.local ? p.local : { uri: p.uri }}
              label={p.label}
              rotate={p.rotate}
              border={colors.border}
              badgeBg={colors.accent}
              badgeColor={full.accentForeground}
            />
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.subText }]}>
          Drag the photos — go ahead, touch Cebu first.
        </Text>

        {/* 2. Discover */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Discover Cebu
          </Text>
          <Text style={[styles.sectionSub, { color: colors.subText }]}>
            Twelve handpicked spots across beaches, falls, and heritage towns.
          </Text>

          <View style={[styles.mapVisual, { backgroundColor: water, borderColor: colors.border }]}>
            <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 340 240" preserveAspectRatio="xMidYMid slice">
              {/* water texture */}
              <Path d="M-10,190 Q60,175 120,188 T260,182 T360,190 L360,250 L-10,250 Z" fill={isDarkMode ? '#0E2839' : '#C4DEEF'} opacity={0.7} />
              <Path d="M-10,40 Q70,28 150,36 T360,30 L360,-10 L-10,-10 Z" fill={isDarkMode ? '#0E2839' : '#C4DEEF'} opacity={0.5} />
              {/* Cebu island landmass */}
              <Path
                d="M150,8 C165,30 172,60 168,95 C165,125 178,150 170,180 C164,205 150,228 138,232 C126,235 118,210 122,185 C126,160 112,140 116,110 C120,80 132,40 140,12 Z"
                fill={land}
                stroke={colors.border}
                strokeWidth={1.5}
              />
              {/* Mactan islet */}
              <Ellipse cx={198} cy={105} rx={16} ry={10} fill={land} stroke={colors.border} strokeWidth={1} />
              {/* parks */}
              <Ellipse cx={148} cy={70} rx={10} ry={7} fill={park} opacity={0.9} />
              <Ellipse cx={152} cy={165} rx={12} ry={8} fill={park} opacity={0.9} />
              {/* main coastal road */}
              <Path d="M148,14 C158,50 152,90 156,125 C159,155 164,185 152,222" fill="none" stroke={road} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="7 4" />
              {/* cross-island road */}
              <Path d="M128,120 C140,118 160,116 186,108" fill="none" stroke={road} strokeWidth={2.5} strokeLinecap="round" />
              {/* town dots */}
              <Circle cx={156} cy={108} r={2.5} fill={colors.subText || colors.text} opacity={0.6} />
              <Circle cx={198} cy={105} r={2.5} fill={colors.subText || colors.text} opacity={0.6} />
              <Circle cx={158} cy={190} r={2.5} fill={colors.subText || colors.text} opacity={0.6} />
            </Svg>
            {/* map labels */}
            <Text style={[styles.mapLabel, { left: '8%', top: '10%', color: colors.subText }]}>Camotes Sea</Text>
            <Text style={[styles.mapLabel, { left: '58%', top: '38%', color: colors.subText }]}>Mactan</Text>
            <Text style={[styles.mapLabel, { left: '60%', top: '72%', color: colors.subText }]}>Bohol Strait</Text>
            {featured.map((s, i) => (
              <View key={s.id} style={[styles.pinPlanted, { left: PIN_POSITIONS[i].left, top: PIN_POSITIONS[i].top }]}>
                {i === 0 && (
                  <View style={[styles.pinBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.pinBubbleText, { color: colors.text }]} numberOfLines={1}>{s.title}</Text>
                  </View>
                )}
                <View style={[styles.pinHead, { backgroundColor: colors.accent, borderColor: full.accentForeground }]}>
                  <MapPin size={13} color={full.accentForeground} />
                </View>
                <View style={styles.pinStem} />
                <View style={styles.pinShadow} />
              </View>
            ))}
            <View style={[styles.mapFooter, { backgroundColor: full.muted }]}>
              <Feather name="compass" size={14} color={colors.accent} />
              <Text style={[styles.mapFooterText, { color: colors.text }]}>
                Cebu Island • 12 spots pinned
              </Text>
            </View>
          </View>

          <Text style={[styles.pullLine, { color: colors.text }]}>
            Your favorite spot is waiting — pick one and go.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {featured.map((s) => (
              <View key={s.id} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: s.img }} style={styles.chipImg} />
                <View style={styles.chipInfo}>
                  <Text style={[styles.chipTitle, { color: colors.text }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={[styles.chipLoc, { color: colors.subText }]}>{s.loc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3. Journey */}
        <View style={[styles.journey, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.journeyTitle, { color: colors.text }]}>
            Start Your Journey Now
          </Text>
          <Text style={[styles.journeySub, { color: colors.subText }]}>
            Save spots, navigate offline notes, and meet verified local guides.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/login')}
            activeOpacity={0.9}
          >
            <Text style={[styles.primaryText, { color: full.accentForeground }]}>Log In</Text>
            <ArrowRight size={18} color={full.accentForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => router.push('/register')}
            activeOpacity={0.9}
          >
            <Text style={[styles.secondaryText, { color: colors.text }]}>Create account</Text>
          </TouchableOpacity>
          <Text style={[styles.terms, { color: colors.subText }]}>
            Free forever for travelers. No card needed.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.OS === 'android' ? 32 : 56 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  brand: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  signIn: { fontSize: 15, fontWeight: '700' },
  hero: { alignItems: 'center', marginTop: 18, marginBottom: 6 },
  logoBadge: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, transform: [{ rotate: '-10deg' }],
  },
  logoText: { fontSize: 32, fontWeight: '900' },
  heroTitle: { fontSize: 40, fontWeight: '900', textAlign: 'center', lineHeight: 44, letterSpacing: -0.5 },
  heroSub: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 300 },
  photoRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 22, marginBottom: 4, minHeight: 190,
  },
  photoWrap: {
    width: width * 0.29, height: 180, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, marginHorizontal: -6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 12 },
      android: { elevation: 5 },
      default: {},
    }),
  },
  photo: { width: '100%', height: '100%' },
  photoTag: {
    position: 'absolute', bottom: 8, left: 8, right: 8,
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 6, alignItems: 'center',
  },
  photoTagText: { fontSize: 10, fontWeight: '800' },
  hint: { textAlign: 'center', fontSize: 12, marginTop: 6, marginBottom: 8 },
  section: { marginTop: 26 },
  sectionTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  sectionSub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  mapVisual: {
    marginTop: 14, borderRadius: 24, borderWidth: 1,
    height: 260, overflow: 'hidden', position: 'relative',
    justifyContent: 'center', alignItems: 'center',
  },
  mapLabel: { position: 'absolute', fontSize: 10, fontWeight: '600', fontStyle: 'italic', opacity: 0.8 },
  pinPlanted: { position: 'absolute', alignItems: 'center', marginLeft: -15, marginTop: -34 },
  pinBubble: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
    marginBottom: 3, maxWidth: 120,
  },
  pinBubbleText: { fontSize: 10, fontWeight: '800' },
  pinHead: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 4 },
      default: {},
    }),
  },
  pinStem: { width: 2, height: 8, backgroundColor: '#8A94A6', opacity: 0.9 },
  pinShadow: { width: 16, height: 5, borderRadius: 3, backgroundColor: '#000', opacity: 0.22, marginTop: 1 },
  mapFooter: {
    position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, gap: 6,
  },
  mapFooterText: { fontSize: 12, fontWeight: '700' },
  pullLine: { fontSize: 17, fontWeight: '800', marginTop: 16, lineHeight: 24 },
  chips: { paddingTop: 12, paddingRight: 8, gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 16, padding: 8, marginRight: 10, width: 210,
  },
  chipImg: { width: 44, height: 44, borderRadius: 12 },
  chipInfo: { marginLeft: 10, flex: 1 },
  chipTitle: { fontSize: 13, fontWeight: '800' },
  chipLoc: { fontSize: 12, marginTop: 1 },
  journey: {
    marginTop: 26, borderRadius: 24, borderWidth: 1, padding: 22, alignItems: 'center',
  },
  journeyTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  journeySub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  primaryBtn: {
    marginTop: 18, width: '100%', height: 56, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  primaryText: { fontSize: 17, fontWeight: '800' },
  secondaryBtn: {
    marginTop: 10, width: '100%', height: 56, borderRadius: 16,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 12, marginTop: 12 },
});

export default WelcomeScreen;

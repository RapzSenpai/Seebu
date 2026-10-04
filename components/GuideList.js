import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { Phone, ShieldCheck, Star, Users } from 'lucide-react-native';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import { cx } from '../utils/cloudinary';

/**
 * Local Guides for a spot, backed by the Firestore `guides` collection.
 * Every guide document carries a numeric `spotId` that matches an entry in
 * utils/spots.js, so a guide attaches to exactly one destination.
 *
 * Guide docs are created by the admin (Firebase Console) — until some exist,
 * this renders an honest empty state instead of placeholder people.
 *
 * Contact stays intentionally simple: it dials the number stored on the
 * guide's document. Guides are recommendations, not employees — any fee or
 * schedule is arranged directly with the guide, outside the app.
 */
const GuideList = ({ spot, theme: themeProp }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  // SpotDetail passes a token-built theme adapter; fall back to context.
  // Normalize subtext/subText key casing across callers.
  const theme = themeProp ?? { ...colors, subtext: colors.subText };
  const subtext = theme.subtext ?? theme.subText ?? colors.subText;
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadGuides = async () => {
      if (!spot || spot.id == null) {
        setLoading(false);
        return;
      }
      // GUIDE-04: coerce — console-created string ids would never match.
      const sid = Number(spot.id);
      if (!Number.isFinite(sid)) {
        setLoading(false);
        return;
      }
      try {
        const guidesQuery = query(collection(db, 'guides'), where('spotId', '==', sid));
        const snapshot = await getDocs(guidesQuery);
        if (!cancelled) {
          setGuides(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (error) {
        console.warn('Could not load guides:', error?.message);
        if (!cancelled) setGuides([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadGuides();
    return () => {
      cancelled = true;
    };
  }, [spot?.id]);

  const handleBook = (contact) => {
    if (!contact) return;
    Linking.openURL(`tel:${contact}`).catch(() => {});
  };

  if (loading) {
    return <ActivityIndicator size="small" color={theme.accent} style={{ marginTop: 20 }} />;
  }

  if (guides.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Users size={28} color={subtext} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No local guides yet</Text>
        <Text style={[styles.emptyText, { color: subtext }]}>
          Recommended guides for {spot.loc} will show up here once the SeeBu team adds them.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={[styles.sectionHeader, { color: subtext }]}>
        Recommended guides in {spot.loc}
      </Text>
      <Text style={[styles.disclaimer, { color: subtext }]}>
        Listed by SeeBu — contact and arrange with them directly. No in-app booking or payment.
      </Text>
      {guides.map((guide) => (
        <View
          key={guide.id}
          style={[styles.guideCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          {guide.photoUrl ? (
            <Image source={{ uri: cx(guide.photoUrl, 200) }} style={styles.guideImg} />
          ) : (
            <View style={[styles.guideImg, styles.guideInitials, { backgroundColor: theme.border }]}>
              <Text style={[styles.guideInitialsText, { color: theme.accent }]}>
                {(guide.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.guideInfo}>
            <View style={styles.verifyRow}>
              <Text style={[styles.guideName, { color: theme.text }]}>{guide.name}</Text>
              {guide.verified && <ShieldCheck size={16} color={theme.accent} />}
            </View>
            <Text style={[styles.guideSpecialty, { color: subtext }]}>{guide.specialty}</Text>
            {!!guide.location && (
              <Text style={[styles.guideLocation, { color: subtext }]}>{guide.location}</Text>
            )}

            {guide.rating != null && (
              <View style={styles.ratingRow}>
                <Star size={14} color={theme.accent} fill={theme.accent} />
                <Text style={[styles.ratingText, { color: subtext }]}>
                  {guide.rating}
                  {guide.reviews != null ? ` (${guide.reviews} reviews)` : ''}
                </Text>
              </View>
            )}

            {!!guide.contact && (
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: theme.accent }]}
                onPress={() => handleBook(guide.contact)}
              >
                <Phone size={14} color={full.primaryForeground} />
                <Text style={[styles.contactBtnText, { color: full.primaryForeground }]}>Call Guide</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  disclaimer: { fontSize: 12, lineHeight: 17, marginBottom: 12 },
  guideCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  guideImg: { width: 84, height: 84, borderRadius: 12 },
  guideInitials: { justifyContent: 'center', alignItems: 'center' },
  guideInitialsText: { fontSize: 30, fontWeight: '900' },
  guideInfo: { flex: 1, flexShrink: 1, marginLeft: 12, justifyContent: 'center' },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideName: { fontSize: 15, fontWeight: 'bold', flexShrink: 1 },
  guideSpecialty: { fontSize: 12, marginTop: 2 },
  guideLocation: { fontSize: 11, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, gap: 4 },
  ratingText: { fontSize: 12 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  contactBtnText: { fontWeight: 'bold', fontSize: 13 },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});

export default GuideList;

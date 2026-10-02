import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { Phone, ShieldCheck, Star, Users } from 'lucide-react-native';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Local Guides for a spot, backed by the Firestore `guides` collection.
 * Every guide document carries a numeric `spotId` that matches an entry in
 * utils/spots.js, so a guide attaches to exactly one destination.
 *
 * Guide docs are created by the admin (Firebase Console) — until some exist,
 * this renders an honest empty state instead of placeholder people.
 *
 * Booking stays intentionally simple: it dials the contact number stored on
 * the guide's document (same tel: flow the app already used).
 */
const GuideList = ({ spot, theme }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadGuides = async () => {
      if (!spot || spot.id == null) {
        setLoading(false);
        return;
      }
      try {
        const guidesQuery = query(collection(db, 'guides'), where('spotId', '==', spot.id));
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
        <Users size={28} color={theme.subtext} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No local guides yet</Text>
        <Text style={[styles.emptyText, { color: theme.subtext }]}>
          Certified guides for {spot.loc} will show up here once the SeeBu team adds them.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={[styles.sectionHeader, { color: theme.subtext }]}>
        Certified Locals in {spot.loc}
      </Text>
      {guides.map((guide) => (
        <View
          key={guide.id}
          style={[styles.guideCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          {guide.photoUrl ? (
            <Image source={{ uri: guide.photoUrl }} style={styles.guideImg} />
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
            <Text style={[styles.guideSpecialty, { color: theme.subtext }]}>{guide.specialty}</Text>
            {!!guide.location && (
              <Text style={[styles.guideLocation, { color: theme.subtext }]}>{guide.location}</Text>
            )}

            {guide.rating != null && (
              <View style={styles.ratingRow}>
                <Star size={14} color={theme.accent} fill={theme.accent} />
                <Text style={[styles.ratingText, { color: theme.subtext }]}>
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
                <Phone size={14} color="#000" />
                <Text style={styles.contactBtnText}>Book Guide</Text>
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
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guideCard: {
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 10,
    borderWidth: 1,
  },
  guideImg: { width: 100, height: 100, borderRadius: 14 },
  guideInitials: { justifyContent: 'center', alignItems: 'center' },
  guideInitialsText: { fontSize: 36, fontWeight: '900' },
  guideInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideName: { fontSize: 17, fontWeight: 'bold' },
  guideSpecialty: { fontSize: 12, marginTop: 2 },
  guideLocation: { fontSize: 11, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 4 },
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
  contactBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
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

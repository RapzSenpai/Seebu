import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Shared presentational sections for SpotDetail (native + web).
// ponytail: one section kit, both detail screens consume it.

export const Section = ({ title, children, colors, full }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: colors.card, borderColor: colors.border },
    ]}
  >
    <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
    {children}
  </View>
);

export const FactRow = ({ label, value, colors }) => {
  if (!value) return null;
  return (
    <View style={styles.factRow}>
      <Text style={[styles.factLabel, { color: colors.subText }]}>{label}</Text>
      <Text style={[styles.factValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

export const Stars = ({ value, count, colors, full, size = 14 }) => {
  if (value == null) return null;
  const filled = Math.round(value);
  return (
    <View style={styles.stars}>
      <Text style={[styles.starGlyph, { color: colors.accent, fontSize: size }]}>
        {'★'.repeat(filled)}
        <Text style={{ color: full.mutedForeground }}>
          {'★'.repeat(Math.max(0, 5 - filled))}
        </Text>
      </Text>
      <Text style={[styles.starText, { color: colors.subText }]}>
        {`${value.toFixed(1)}${count ? ` (${count})` : ''}`}
      </Text>
    </View>
  );
};

export const ReviewCard = ({ review, colors, full }) => (
  <View
    style={[
      styles.review,
      { backgroundColor: full.muted },
    ]}
  >
    <View style={styles.reviewHead}>
      <Text style={[styles.reviewName, { color: colors.text }]}>
        {review.n}
      </Text>
      <Text style={[styles.reviewStars, { color: colors.accent }]}>
        {'★'.repeat(review.r)}
      </Text>
    </View>
    <Text style={[styles.reviewText, { color: colors.subText }]}>
      {review.t}
    </Text>
  </View>
);

export const EmptyState = ({ text, colors }) => (
  <Text style={[styles.empty, { color: colors.subText }]}>{text}</Text>
);

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  factRow: { marginBottom: 10 },
  factLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starGlyph: { fontWeight: '900' },
  starText: { fontSize: 12, marginLeft: 6 },
  review: { padding: 12, borderRadius: 12, marginBottom: 10 },
  reviewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: { fontSize: 14, fontWeight: '700' },
  reviewStars: { fontSize: 12 },
  reviewText: { lineHeight: 20, fontSize: 13, marginTop: 6 },
  empty: { fontSize: 13, lineHeight: 20 },
});

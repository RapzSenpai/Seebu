import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

import { db } from '../firebase';
import { reviewDocId } from '../utils/useReviewStats';

// ponytail: one composer, both detail screens consume it. Identical
// write/validate logic twice would rot apart.
const ReviewComposer = ({ spotId, existing, uid, displayName, colors, full, onDone }) => {
  const [picked, setPicked] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Sync when the screen hands a different existing review (spot change).
  React.useEffect(() => {
    setPicked(existing?.rating ?? 0);
    setText(existing?.text ?? '');
    setError('');
  }, [existing?.updatedAt, spotId]);

  const submit = async () => {
    if (!Number.isFinite(Number(spotId))) {
      setError('This spot cannot receive reviews yet.');
      return;
    }
    const clean = text.trim();
    if (!picked) {
      setError('Pick a star rating first.');
      return;
    }
    if (!clean) {
      setError('Write a few words about the spot.');
      return;
    }
    if (clean.length > 500) {
      setError(`Keep it under 500 characters (now ${clean.length}).`);
      return;
    }
    setError('');
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await setDoc(
        doc(db, 'reviews', reviewDocId(spotId, uid)),
        {
          spotId: Number(spotId),
          uid,
          displayName,
          rating: picked,
          text: clean,
          updatedAt: now,
          ...(existing ? {} : { createdAt: now }),
        },
        { merge: true }
      );
      onDone?.();
    } catch (e) {
      setError('Could not save — check connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'reviews', reviewDocId(spotId, uid)));
      setPicked(0);
      setText('');
      onDone?.();
    } catch {
      setError('Could not delete — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Share your experience</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setPicked(n)}
            style={styles.starHit}
            accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              color={n <= picked ? colors.accent : full.mutedForeground}
              fill={n <= picked ? colors.accent : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: full.muted,
          },
        ]}
        placeholder="What was it like?"
        placeholderTextColor={colors.subText}
        multiline
        numberOfLines={3}
        maxLength={500}
        value={text}
        onChangeText={setText}
      />
      {!!error && <Text style={[styles.error, { color: full.destructive }]}>{error}</Text>}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.accent }, busy && { opacity: 0.7 }]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={full.accentForeground} size="small" />
          ) : (
            <Text style={[styles.submitText, { color: full.accentForeground }]}>
              {existing ? 'Update review' : 'Post review'}
            </Text>
          )}
        </TouchableOpacity>
        {!!existing && (
          <TouchableOpacity onPress={remove} disabled={busy} style={styles.delete}>
            <Text style={[styles.deleteText, { color: full.destructive }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  stars: { flexDirection: 'row', marginBottom: 12 },
  starHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  error: { fontSize: 13, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  submit: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  submitText: { fontWeight: '800', fontSize: 16 },
  delete: { padding: 10 },
  deleteText: { fontWeight: '700', fontSize: 14 },
});

export default ReviewComposer;

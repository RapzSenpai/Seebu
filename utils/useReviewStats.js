import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Real review aggregates for every spot. One getDocs, derived per-spot
// { avg, count } plus newest-first lists. Empty/error = {} so callers fall
// back to static samples. spotIds always Number (admin customs are numeric).
export const reviewDocId = (spotId, uid) => `${Number(spotId)}_${uid}`;

export const useReviewStats = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      setReviews(
        snap.docs.map((d) => {
          const data = d.data();
          return { ...data, id: d.id, spotId: Number(data.spotId) };
        })
      );
    } catch {
      // Offline / denied: static samples stay.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const byId = {};
    reviews.forEach((r) => {
      if (typeof r.rating !== 'number' || !Number.isFinite(r.spotId)) return;
      const entry = byId[r.spotId] || (byId[r.spotId] = { total: 0, count: 0 });
      entry.total += r.rating;
      entry.count += 1;
    });
    const out = {};
    Object.entries(byId).forEach(([id, e]) => {
      out[id] = { avg: e.total / e.count, count: e.count };
    });
    return out;
  }, [reviews]);

  const listFor = useCallback(
    (spotId) =>
      reviews
        .filter((r) => r.spotId === Number(spotId))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [reviews]
  );

  // ponytail: own activity for the Settings strip. avg null at zero (never NaN).
  const mine = useCallback(
    (uid) => {
      if (!uid) return { count: 0, avg: null };
      const own = reviews.filter(
        (r) => r.uid === uid && typeof r.rating === 'number'
      );
      if (own.length === 0) return { count: 0, avg: null };
      return {
        count: own.length,
        avg: own.reduce((t, r) => t + r.rating, 0) / own.length,
      };
    },
    [reviews]
  );

  return { stats, listFor, mine, loading, refresh };
};

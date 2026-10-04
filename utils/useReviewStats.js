import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Real review aggregates for every spot. One getDocs, derived per-spot
// { avg, count } plus newest-first lists. Empty/error = {} so callers fall
// back to static samples. spotIds always Number (admin customs are numeric).
export const reviewDocId = (spotId, uid) => `${Number(spotId)}_${uid}`;

// REV-01/PERF-01: one shared fetch for every hook instance. Mounts within
// REVIEW_TTL_MS reuse the rows (Explore + Settings + Map + detail no longer
// each fire a full collection read); explicit refresh() always hits network.
// Still one-shot reads — no listener architecture change.
const REVIEW_TTL_MS = 60_000;
const store = { rows: [], at: 0, inflight: null };
const subs = new Set();
const notify = () => subs.forEach((fn) => fn(store.rows));

const loadReviews = async () => {
  if (store.inflight) return store.inflight;
  const run = (async () => {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      store.rows = snap.docs.map((d) => {
        const data = d.data();
        return { ...data, id: d.id, spotId: Number(data.spotId) };
      });
      store.at = Date.now();
    } catch {
      // Offline / denied: keep previous rows (static fallback covers first run).
    } finally {
      store.inflight = null;
    }
    notify();
    return store.rows;
  })();
  store.inflight = run;
  return run;
};

export const useReviewStats = () => {
  const [reviews, setReviews] = useState(store.rows);
  const [loading, setLoading] = useState(store.rows.length === 0);

  useEffect(() => {
    subs.add(setReviews);
    // Sync immediately: a load that finished between useState init and
    // subscribing would otherwise wait for the next load to appear.
    setReviews(store.rows);
    // Mount load: network only on never-loaded or stale cache. store.at
    // (not row count) marks loaded — a successful empty read stays cached
    // until TTL instead of refetching on every mount.
    const p =
      store.at === 0 || Date.now() - store.at > REVIEW_TTL_MS
        ? loadReviews()
        : Promise.resolve();
    p.finally(() => setLoading(false));
    return () => {
      subs.delete(setReviews);
    };
  }, []);

  const refresh = useCallback(() => loadReviews(), []);

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

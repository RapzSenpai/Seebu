import { useCallback, useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';

import { db, auth } from '../firebase';
import { useUser } from '../UserContext';

// ponytail: ids array on the user doc, not a subcollection (N ≤ 12).
// Own-doc merge writes are already allowed by firestore.rules.
export const useSavedPlaces = () => {
  const { profile, refresh } = useUser();
  const [busy, setBusy] = useState(false);
  // ponytail: optimistic ids flip the UI instantly; the refresh converging
  // right behind it only confirms. No waiting on round-trips to look saved.
  const [optimistic, setOptimistic] = useState(null);
  const profileIds = Array.isArray(profile?.savedIds)
    ? profile.savedIds.map(Number).filter(Number.isFinite)
    : [];
  const savedIds = optimistic ?? profileIds;

  // Drop the override once the profile converges (covers toggles made from
  // a different screen's hook instance).
  const profileKey = profileIds.join(',');
  const optimisticKey = optimistic ? optimistic.join(',') : null;
  useEffect(() => {
    if (optimistic && profileKey === optimisticKey) setOptimistic(null);
  }, [profileKey, optimisticKey]);

  const isSaved = useCallback(
    (id) => savedIds.includes(Number(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedIds.join(',')]
  );

  const toggleSave = useCallback(
    async (spotId) => {
      const uid = auth.currentUser?.uid;
      if (!uid || busy) return false;
      const id = Number(spotId);
      if (!Number.isFinite(id)) return false;
      setBusy(true);
      try {
        const next = savedIds.includes(id)
          ? savedIds.filter((s) => s !== id)
          : [...savedIds, id];
        await setDoc(
          doc(db, 'users', uid),
          { savedIds: next, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setOptimistic(next);
        await refresh?.();
        return next.includes(id);
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedIds.join(','), refresh, busy]
  );

  return { savedIds, isSaved, toggleSave, busy };
};

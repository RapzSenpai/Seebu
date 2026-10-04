import { useCallback, useEffect, useState } from 'react';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

import { db, auth } from '../firebase';
import { useUser } from '../UserContext';

// ponytail: ids array on the user doc, not a subcollection (N ≤ 12).
// Own-doc merge writes are already allowed by firestore.rules.
export const useSavedPlaces = () => {
  const { profile, refresh } = useUser();
  const [busy, setBusy] = useState(false);
  // Pending write, not a snapshot: { id, adding }. The displayed list
  // re-applies it onto the live profile each render, so concurrent changes
  // from another screen survive underneath the override.
  const [pending, setPending] = useState(null);
  const profileIds = Array.isArray(profile?.savedIds)
    ? profile.savedIds.map(Number).filter(Number.isFinite)
    : [];
  const savedIds = pending
    ? pending.adding
      ? (profileIds.includes(pending.id) ? profileIds : [...profileIds, pending.id])
      : profileIds.filter((s) => s !== pending.id)
    : profileIds;

  // Drop the override as soon as the profile reflects this write's change
  // to the targeted id — other ids' concurrent changes are preserved.
  const profileKey = profileIds.join(',');
  useEffect(() => {
    if (!pending) return;
    const has = profileIds.includes(pending.id);
    if ((pending.adding && has) || (!pending.adding && !has)) setPending(null);
  }, [profileKey, pending]);

  const isSaved = useCallback(
    (id) => savedIds.includes(Number(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedIds.join(',')]
  );

  // SAVE-01: atomic array ops instead of read-modify-write, so two
  // screens toggling at once can't clobber each other. Falls back to a
  // merge-write when the user doc doesn't exist yet (older web accounts).
  const toggleSave = useCallback(
    async (spotId) => {
      const uid = auth.currentUser?.uid;
      if (!uid || busy) return false;
      const id = Number(spotId);
      if (!Number.isFinite(id)) return false;
      const adding = !savedIds.includes(id);
      setBusy(true);
      try {
        setOptimistic(adding ? [...savedIds, id] : savedIds.filter((s) => s !== id));
        try {
          await updateDoc(doc(db, 'users', uid), {
            savedIds: adding ? arrayUnion(id) : arrayRemove(id),
            updatedAt: new Date().toISOString(),
          });
        } catch {
          const next = adding ? [...savedIds, id] : savedIds.filter((s) => s !== id);
          await setDoc(
            doc(db, 'users', uid),
            { savedIds: next, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        }
        await refresh?.();
        return adding;
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedIds.join(','), refresh, busy]
  );

  // Remove-only path for tombstone rows (toggleSave would re-add).
  const unsave = useCallback(
    async (spotId) => {
      const uid = auth.currentUser?.uid;
      if (!uid || busy) return false;
      const id = Number(spotId);
      if (!Number.isFinite(id)) return false;
      setPending({ id, adding: false });
      setBusy(true);
      try {
        try {
          await updateDoc(doc(db, 'users', uid), {
            savedIds: arrayRemove(id),
            updatedAt: new Date().toISOString(),
          });
        } catch {
          await setDoc(
            doc(db, 'users', uid),
            { savedIds: arrayRemove(id), updatedAt: new Date().toISOString() },
            { merge: true }
          );
        }
        await refresh?.();
        return true;
      } catch {
        setPending(null);
        return false;
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedIds.join(','), refresh, busy]
  );

  return { savedIds, isSaved, toggleSave, unsave, busy };
};

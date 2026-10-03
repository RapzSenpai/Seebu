import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { cebuSpots } from './spots';

// Merged catalog: static built-ins instantly, then Firestore overlays.
// A doc with the same numeric spotId overrides the built-in; higher spotIds
// are admin-published customs. published:false hides. Offline = static.
export const useSpots = () => {
  const [overrides, setOverrides] = useState([]);
  const [syncing, setSyncing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'spots'));
      const docs = snap.docs.map((d) => ({ _docId: d.id, ...d.data() }));
      setOverrides(docs);
    } catch {
      // Offline / denied: static catalog stays.
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byId = new Map();
  cebuSpots.forEach((s) => byId.set(s.spotId ?? s.id, { ...s, builtin: true }));
  overrides.forEach((o) => {
    if (o.spotId == null) return;
    if (o.published === false) {
      byId.delete(o.spotId);
      return;
    }
    const base = byId.get(o.spotId);
    byId.set(o.spotId, {
      ...(base || {}),
      ...o,
      id: o.spotId,
      builtin: !!base,
      _custom: !base,
    });
  });

  return {
    spots: [...byId.values()],
    syncing,
    refresh,
    customs: overrides.filter((o) => o.spotId != null),
    hidden: overrides.filter((o) => o.spotId != null && o.published === false),
  };
};

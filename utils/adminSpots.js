import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { cebuSpots } from './spots';

const isBuiltinId = (spotId) =>
  cebuSpots.some((s) => (s.spotId ?? s.id) === spotId);

// Legacy max+1 fallback (kept for compat). New publishes use
// allocateSpotId() below — same numbering, race-safe via transaction.
export const nextSpotId = (spots) =>
  spots.reduce((m, s) => Math.max(m, s.spotId ?? s.id ?? 0), 12) + 1;

// Race-safe spotId allocation: a counters/spots doc hands out each id once.
// The transaction touches only the counter doc. Bootstrap (max existing id)
// is computed BEFORE the transaction — collection reads inside a tx invite
// contention retries, and tx.get can't take a collection reference.
// Requires the matching `counters` rule in firestore.rules (deploy it).
// ponytail: single-admin app, one counter doc is enough.
export const allocateSpotId = async (spots = []) => {
  const counterRef = doc(db, 'counters', 'spots');
  // Bootstrap default from the local list; refined from Firestore when the
  // counter doesn't exist yet. Peek first so the common case (live counter)
  // costs one doc read and no catalog scan. Any read failure aborts —
  // initializing the counter from an unverified maximum could hand out a
  // colliding id, so the publish is blocked with a retryable error instead.
  let bootstrap = null;
  try {
    const peek = await getDoc(counterRef);
    if (!peek.exists() || !Number.isFinite(peek.data()?.next)) {
      const snap = await getDocs(collection(db, 'spots'));
      const maxDoc = snap.docs.reduce((m, d) => Math.max(m, d.data()?.spotId ?? 0), 12);
      const maxLocal = spots.reduce((m, s) => Math.max(m, s.spotId ?? s.id ?? 0), 12);
      bootstrap = Math.max(maxDoc, maxLocal) + 1;
    }
  } catch (e) {
    throw new Error(
      `Couldn't verify spot IDs (${e?.message || 'read failed'}). Check connection and try again.`
    );
  }
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next =
      snap.exists() && Number.isFinite(snap.data()?.next) ? snap.data().next : bootstrap;
    if (!Number.isFinite(next)) {
      throw new Error('Spot counter unavailable — try again.');
    }
    tx.set(counterRef, { next: next + 1 }, { merge: true });
    return next;
  });
};

export const publishSpot = async (data) => {
  const ref = await addDoc(collection(db, 'spots'), {
    ...data,
    published: true,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

export const saveSpotEdit = async (spot, data) => {
  if (spot._docId) {
    // Existing Firestore doc (override or custom): update in place.
    await setDoc(doc(db, 'spots', spot._docId), data, { merge: true });
    return spot._docId;
  }
  // Built-in with no override yet: create the override doc.
  const ref = await addDoc(collection(db, 'spots'), {
    ...data,
    spotId: spot.spotId ?? spot.id,
    published: true,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

// Hard delete for custom spots only (built-ins use hideSpot instead).
export const removeSpotDoc = async (spot) => {
  if (!spot._docId || !spot._custom) {
    throw new Error('Only custom spots can be deleted. Hide built-ins instead.');
  }
  await deleteDoc(doc(db, 'spots', spot._docId));
};
export const hideSpot = async (spot) => {
  // Hiding removes any spot from users via an override doc.
  const spotId = spot.spotId ?? spot.id;
  if (spot._docId) {
    await setDoc(doc(db, 'spots', spot._docId), { published: false }, { merge: true });
    return spot._docId;
  }
  const ref = await addDoc(collection(db, 'spots'), {
    spotId,
    published: false,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

// Unhide: built-ins revert to static (drop the override), customs flip back.
export const restoreSpot = async (hiddenDoc) => {
  if (!hiddenDoc._docId) {
    throw new Error('Nothing to restore.');
  }
  if (isBuiltinId(hiddenDoc.spotId)) {
    await deleteDoc(doc(db, 'spots', hiddenDoc._docId));
  } else {
    await setDoc(doc(db, 'spots', hiddenDoc._docId), { published: true }, { merge: true });
  }
};

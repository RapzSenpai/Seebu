import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { cebuSpots } from './spots';

const isBuiltinId = (spotId) =>
  cebuSpots.some((s) => (s.spotId ?? s.id) === spotId);

// Admin writes for the spots collection. Reads go through useSpots().
// Built-ins (spotId 1-12): edit saves an override doc, never deleted.
// Customs (spotId 13+): full edit + delete.
export const nextSpotId = (spots) =>
  spots.reduce((m, s) => Math.max(m, s.spotId ?? s.id ?? 0), 12) + 1;

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
